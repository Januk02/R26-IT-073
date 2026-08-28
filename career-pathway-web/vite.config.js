import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Custom Vite plugin: auto-starts the Python FastAPI server
 * when the dev server boots, and kills it on shutdown.
 */
function pythonBackendPlugin() {
  let pyProcess = null

  // Resolve paths
  const aiEngineDir = path.resolve(__dirname, '..', 'ai-engine', 'models')
  const venvPython = path.resolve(__dirname, '..', 'ai-engine', 'venv', 'Scripts', 'python.exe')

  return {
    name: 'python-backend',

    configureServer(server) {
      const pythonExe = existsSync(venvPython) ? venvPython : 'python'

      console.log('')
      console.log('\x1b[36m⚡ [Python Backend]\x1b[0m Starting FastAPI server...')
      console.log(`   Python: ${pythonExe}`)
      console.log(`   CWD:    ${aiEngineDir}`)
      console.log('')

      // Use quoted command to handle spaces in Windows paths
      pyProcess = spawn(`"${pythonExe}" api_server.py`, {
        cwd: aiEngineDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env },
        shell: true,
        windowsHide: false,
      })

      // Prefix Python output so it's easy to distinguish in terminal
      pyProcess.stdout.on('data', (data) => {
        data.toString().trim().split('\n').forEach(line => {
          if (line) console.log(`\x1b[33m   [AI Engine]\x1b[0m ${line}`)
        })
      })

      pyProcess.stderr.on('data', (data) => {
        data.toString().trim().split('\n').forEach(line => {
          if (!line) return
          // Uvicorn logs to stderr — color INFO green, errors red
          if (line.includes('INFO') || line.includes('Uvicorn running') || line.includes('Started')) {
            console.log(`\x1b[32m   [AI Engine]\x1b[0m ${line}`)
          } else {
            console.log(`\x1b[31m   [AI Engine]\x1b[0m ${line}`)
          }
        })
      })

      pyProcess.on('error', (err) => {
        console.error(`\x1b[31m⚠ [Python Backend] Failed to start: ${err.message}\x1b[0m`)
        console.error('   Ensure Python is installed and ai-engine/venv exists.')
      })

      pyProcess.on('exit', (code) => {
        if (code !== null && code !== 0) {
          console.log(`\x1b[31m⚠ [Python Backend] Process exited with code ${code}\x1b[0m`)
        }
        pyProcess = null
      })

      // Cleanup: kill Python when Vite shuts down
      const cleanup = () => {
        if (pyProcess && !pyProcess.killed) {
          console.log('\n\x1b[36m⚡ [Python Backend]\x1b[0m Shutting down AI Engine...')
          try {
            spawn('taskkill', ['/pid', String(pyProcess.pid), '/f', '/t'], {
              stdio: 'ignore',
              shell: true,
            })
          } catch (e) {
            // Ignore cleanup errors
          }
          pyProcess = null
        }
      }

      server.httpServer?.on('close', cleanup)
      process.on('exit', cleanup)
      process.on('SIGINT', () => { cleanup(); process.exit(0) })
      process.on('SIGTERM', () => { cleanup(); process.exit(0) })
    }
  }
}

export default defineConfig({
  // Force restart comment to reload Python backend server
  plugins: [react(), pythonBackendPlugin()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
