import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Loader2, Search } from 'lucide-react';
import axios from 'axios';
import API from '../config/api';
import './SkillInput.css';

export default function SkillInput({ onSkillsChange, resetKey }) {
  const [inputValue, setInputValue] = useState('');
  const [skills, setSkills] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Reset when refreshKey changes
  useEffect(() => {
    setInputValue('');
    setSkills([]);
    setSuggestions([]);
  }, [resetKey]);

  // Debounced API call for fuzzy skill suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (inputValue.trim().length >= 2) {
        setIsLoading(true);
        try {
          const response = await axios.get(API.SUGGEST_SKILLS, {
            params: { q: inputValue.trim() },
            timeout: 3000,
          });
          const backendSuggestions = response.data.suggestions || [];
          const filtered = backendSuggestions.filter(
            (s) => !skills.includes(s)
          );
          setSuggestions(filtered);
        } catch (error) {
          console.log('Skill suggestion API unavailable');
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(delayDebounceFn);
  }, [inputValue, skills]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSuggestions([]);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSkill = (skill) => {
    if (!skill.trim() || skills.includes(skill)) return;
    const newSkills = [...skills, skill];
    setSkills(newSkills);
    setInputValue('');
    setSuggestions([]);
    onSkillsChange(newSkills);
    inputRef.current?.focus();
  };

  const removeSkill = (skillToRemove) => {
    const newSkills = skills.filter(s => s !== skillToRemove);
    setSkills(newSkills);
    onSkillsChange(newSkills);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleanSkill = inputValue.trim().replace(/,$/, '');
      if (cleanSkill) addSkill(cleanSkill);
    }
  };

  const handleChange = (e) => {
    const text = e.target.value;
    if (text.endsWith(',') || text.endsWith(', ')) {
      const cleanSkill = text.replace(/[, ]+$/, '').trim();
      if (cleanSkill && !skills.includes(cleanSkill)) {
        addSkill(cleanSkill);
      } else {
        setInputValue('');
      }
    } else {
      setInputValue(text);
    }
  };

  return (
    <div className="skill-input-container" ref={containerRef}>
      {/* Chips */}
      <div className="skill-chips">
        <AnimatePresence>
          {skills.map((skill) => (
            <motion.div
              key={skill}
              className="skill-chip"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
              layout
            >
              <Zap size={12} className="chip-icon" />
              <span>{skill}</span>
              <button
                className="chip-remove"
                onClick={() => removeSkill(skill)}
                aria-label={`Remove ${skill}`}
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className={`skill-input-wrapper ${isFocused ? 'focused' : ''}`}>
        <Search size={18} className="input-icon" />
        <input
          ref={inputRef}
          type="text"
          className="skill-input"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={skills.length === 0 
            ? "Type a skill (e.g., Python, React, AWS)..." 
            : "Add another skill..."
          }
          id="skill-input-field"
        />
        {isLoading && <Loader2 size={18} className="input-spinner" />}
        {skills.length > 0 && (
          <span className="skill-count">{skills.length}</span>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            className="suggestions-dropdown"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {suggestions.map((item, index) => (
              <button
                key={index}
                className="suggestion-item"
                onClick={() => addSkill(item)}
              >
                <Zap size={14} className="suggestion-icon" />
                <span>{item}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
