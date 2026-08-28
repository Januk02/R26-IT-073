import pandas as pd
import spacy
import re
import os
import glob # NEW: For automatically finding all raw files

class AdvancedNLPCleaner:
    def __init__(self):
        print("Initializing Master NLP Engine...")
        
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Downloading spaCy model (en_core_web_sm)...")
            os.system("python -m spacy download en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")
            
        # ---------------------------------------------------------
        # THE EXPANDED ENTERPRISE IT SKILL DICTIONARY
        # ---------------------------------------------------------
        self.skill_dictionary = [
            # Programming & Scripting
            'Python', 'Java', 'C++', 'C#', 'JavaScript', 'TypeScript', 'Go', 'Golang', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Rust', 'Scala',
            # Programming & Scripting (Extended)
            'C', 'R', 'Fortran', 'Assembly', 'COBOL', 'REXX', 'ABAP', 'VBA', 'Scripting',
            # Frontend & UI
            'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'HTML', 'CSS', 'Tailwind', 'Figma', 'React Native', 'Flutter',
            # Databases & Storage
            'SQL', 'NoSQL', 'PostgreSQL', 'MongoDB', 'MySQL', 'Oracle', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB',
            # Cloud & Infrastructure
            'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'Bash', 'Shell Scripting', 'Ansible', 'VMware',
            # Data Engineering
            'Hadoop', 'Spark', 'Kafka', 'ETL', 'Airflow', 'Snowflake', 'BigQuery', 'Databricks',
            # CI/CD & Version Control
            'CI/CD', 'Jenkins', 'Git', 'GitHub', 'Bitbucket', 'GitLab', 'CircleCI',
            # QA & Testing
            'QA', 'Manual Testing', 'Automation', 'Selenium', 'Cypress', 'Appium', 'JMeter', 'Postman', 'JUnit', 'TestNG',
            # Data Science & Machine Learning
            'Machine Learning', 'Data Science', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Keras', 'NLP', 'Computer Vision',
            'Tableau', 'PowerBI', 'Data Warehousing', 'Data Analytics', 'Excel',
            # Architecture & Methodologies
            'Agile', 'Scrum', 'Jira', 'Kanban', 'Confluence', 'REST API', 'GraphQL', 'Microservices', 'System Design', 'PMP',
            # Security & IT Admin
            'Cybersecurity', 'Penetration Testing', 'Firewalls', 'Security', 'Active Directory', 'Networking', 'TCP/IP', 'DNS', 'VPN',
            # RPA & Low-Code Tools
            'UiPath', 'Automation Anywhere', 'Blue Prism', 'Power Automate', 'Power Apps', 'Orchestrator', 'WorkFusion', 'ProcessGold', 'Bots', 'OCR',
            'OutSystems', 'Mendix', 'Appian', 'Microsoft 365', 'Dataverse',
            # BI & Data Visualization Tools
            'Power BI', 'Looker', 'MicroStrategy', 'Qlik', 'Cognos', 'SSRS', 'SSAS', 'DAX', 'MDX',
            'Data Modeling', 'Data Visualization', 'Data Analysis', 'Redshift',
            # ETL & Data Pipeline Tools
            'Informatica', 'Talend', 'SSIS', 'DataStage', 'Pentaho', 'Matillion', 'Ab Initio',
            'Informatica MDM', 'IBM InfoSphere', 'Apache Atlas', 'Alation', 'Collibra', 'Atlan',
            # IoT & Edge Computing
            'MQTT', 'Arduino', 'Raspberry Pi', 'AWS IoT', 'Azure IoT Hub', 'Zigbee', 'LoRaWAN', 'Node-RED', 'CoAP',
            'AWS Greengrass', 'Azure IoT Edge', 'NVIDIA Jetson', 'KubeEdge', 'EdgeX Foundry', 'OpenVINO', 'Balena', 'IoT',
            # Embedded & Firmware
            'FreeRTOS', 'Zephyr', 'AUTOSAR', 'CAN Bus', 'LIN', 'MISRA', 'JTAG', 'Keil MDK', 'ARM Cortex', 'ARM',
            'UART', 'SPI', 'I2C', 'RTOS', 'OpenOCD', 'IAR Embedded Workbench',
            'Real-Time Systems', 'Bare Metal Programming', 'Embedded Systems', 'PCB', 'Hardware', 'Oscilloscope', 'Keil',
            # Mainframe
            'JCL', 'CICS', 'DB2', 'VSAM', 'IBM MQ', 'IMS', 'RACF', 'TSO/ISPF', 'Easytrieve', 'Batch Processing',
            # Quantum Computing
            'Qiskit', 'Cirq', 'Q#', 'PennyLane', 'Braket', 'IBM Quantum', 'Quantum Inspire', 'Forest SDK', 'Classiq', 'QuTiP',
            # HPC & Parallel Computing
            'MPI', 'OpenMP', 'CUDA', 'SLURM', 'PBS Pro', 'OpenMPI', 'InfiniBand', 'BLAS', 'LAPACK',
            'ROCm', 'OpenCL', 'Parallel Programming', 'Performance Tuning',
            # MLOps & AI Platform Tools
            'MLflow', 'Kubeflow', 'DVC', 'Weights & Biases', 'BentoML', 'Seldon', 'Feast',
            'SageMaker', 'Vertex AI', 'Triton', 'ONNX', 'TensorRT',
            # NLP & Conversational AI
            'HuggingFace', 'spaCy', 'NLTK', 'Transformers', 'LangChain', 'Rasa', 'Gensim', 'FastText', 'BERT',
            'OpenAI API', 'LlamaIndex', 'Dialogflow', 'Amazon Lex', 'Azure Bot Service', 'IBM Watson',
            'Botpress', 'Twilio', 'Wit.ai', 'Kore.ai', 'Voiceflow', 'Data Preprocessing',
            # Computer Vision
            'OpenCV', 'YOLO', 'MediaPipe', 'Detectron2', 'Roboflow', 'LabelImg', 'Deep Learning',
            # Robotics
            'ROS', 'ROS2', 'Gazebo', 'MoveIt', 'PCL', 'SLAM', 'Rviz', 'Nav2', 'Behavior Trees', 'Kinematics', 'Control Systems',
            # Digital Twin & Simulation
            'Azure Digital Twins', 'AWS IoT TwinMaker', 'PTC ThingWorx', 'Siemens MindSphere', 'Bentley iTwin',
            'MATLAB', 'Simulink', 'ANSYS', 'OpenFOAM', 'Adams', 'Modelica', 'dSPACE', 'CarSim', 'AVL', 'Amesim', 'COMSOL',
            'Physics Modelling', 'Simulation',
            # AR/VR & 3D
            'Unity', 'Unreal Engine', 'ARKit', 'ARCore', 'OpenXR', 'WebXR', 'Vuforia', 'HoloLens',
            'Maya', 'Blender', 'SteamVR', '3D Modeling', 'Shader Programming', 'Physics Simulation', 'UX Design',
            # GIS & Spatial
            'ArcGIS', 'QGIS', 'PostGIS', 'Leaflet', 'MapServer', 'GDAL', 'OpenLayers', 'GeoServer', 'ArcPy', 'Mapbox', 'Spatial Data',
            # Middleware & Integration
            'MuleSoft', 'Apigee', 'WSO2', 'TIBCO', 'RabbitMQ', 'ActiveMQ', 'Azure Service Bus',
            'API Gateway', 'AWS API Gateway', 'Azure API Management', 'Kong', 'OAuth', 'SOAP', 'XML', 'JSON',
            # Security & Penetration Testing Tools
            'Metasploit', 'Burp Suite', 'Nmap', 'Nessus', 'Kali Linux', 'Wireshark', 'SQLMap', 'Hydra',
            'John the Ripper', 'Cobalt Strike', 'BloodHound', 'Exploit Development', 'Social Engineering',
            'OWASP', 'CVE', 'Malware Analysis', 'Incident Response',
            # Cloud Security & Compliance Tools
            'AWS GuardDuty', 'Azure Defender', 'Prisma Cloud', 'HashiCorp Vault', 'Cloudtrail', 'CSPM',
            'CrowdStrike', 'Wiz', 'Tenable', 'Falco', 'Qualys', 'Splunk', 'SIEM', 'IAM', 'Compliance',
            'ISO 27001', 'NIST', 'COBIT', 'GDPR', 'SOC 2', 'HIPAA', 'PCI DSS',
            'Archer GRC', 'RSA Archer', 'ServiceNow GRC', 'OneTrust',
            # Digital Forensics
            'EnCase', 'FTK', 'Autopsy', 'Volatility', 'Sleuth Kit', 'X-Ways', 'Cellebrite', 'Magnet AXIOM', 'Chain of Custody',
            # Cloud FinOps
            'AWS Cost Explorer', 'Azure Cost Management', 'CloudHealth', 'Apptio', 'Kubecost',
            'Spot.io', 'Cloudability', 'Infracost', 'Cost Optimization', 'Forecasting', 'Budgeting',
            # Platform & DevOps Tools (Extended)
            'ArgoCD', 'FluxCD', 'Crossplane', 'Backstage', 'Consul', 'Packer', 'Pulumi',
            'Helm', 'Vault', 'CloudFormation', 'Lucidchart', 'Draw.io',
            # Observability & Monitoring
            'Prometheus', 'Grafana', 'Datadog', 'Jaeger', 'OpenTelemetry', 'Elastic Stack', 'Dynatrace',
            'New Relic', 'Loki', 'Zipkin', 'InfluxDB', 'PagerDuty', 'Opsgenie',
            'Monitoring', 'Alerting', 'Log Management', 'Distributed Tracing',
            # Chaos Engineering
            'Gremlin', 'Chaos Monkey', 'LitmusChaos', 'Chaos Toolkit', 'AWS Fault Injection',
            'Steadybit', 'Pumba', 'Chaos Blade', 'Toxiproxy', 'SRE', 'Distributed Systems',
            # Networking & Wireless Infrastructure
            'WiFi 6', '5G', 'LTE', 'Cisco WLC', 'Aruba Networks', 'Ekahau', 'Juniper Mist',
            'RF Planning', 'Spectrum Analyzer', 'WLAN', 'Ruckus', 'Routing', 'Switching',
            # Storage & Backup
            'NetApp', 'EMC', 'Pure Storage', 'Veeam', 'Commvault', 'HPE 3PAR', 'SAN', 'NAS',
            'iSCSI', 'Fibre Channel', 'Zerto', 'RAID', 'Backup & Recovery', 'Disaster Recovery', 'Windows Server',
            # SAP Ecosystem
            'SAP', 'SAP HANA', 'SAP BW', 'SAP Fiori', 'SAP NetWeaver', 'SAP S/4HANA',
            'SAP Cloud ALM', 'Solution Manager', 'Transport Management System', 'CCMS',
            # ITSM & Project Management Tools
            'ServiceNow', 'Freshservice', 'Remedy', 'CMDB', 'ManageEngine', 'ITIL',
            'Jira Service Management', 'Zendesk', 'MS Project', 'Smartsheet', 'Monday.com',
            'Trello', 'Asana', 'PRINCE2', 'Gantt Charts', 'SLA Management',
            'Incident Management', 'Change Management', 'Risk Management',
            # Technical Writing Tools
            'MadCap Flare', 'Sphinx', 'Swagger', 'GitHub Pages', 'RoboHelp', 'Oxygen XML',
            'Notion', 'ReadMe.io', 'Markdown', 'API Documentation', 'Content Management',
            # General IT Skills
            'Documentation', 'Requirements Gathering', 'Stakeholder Management', 'Reporting',
            'Risk Assessment', 'Auditing', 'Testing', 'Debugging', 'Unit Testing', 'Research',
            'Data Quality', 'Metadata Management', 'Process Mapping', 'High Availability',
            'Troubleshooting', 'Resource Planning', 'Waterfall', 'KPI Tracking',
            'Statistics', 'Mathematics', 'Linear Algebra', 'BPMN', 'UML', 'Editing', 'Visualization',
        ]
        
        self.skill_dictionary_lower = [skill.lower() for skill in self.skill_dictionary]

    def extract_advanced_degree(self, text):
        text = str(text).replace('\n', ' ')
        pattern = r'(?i)\b(bachelor\'?s?|b\.?sc|master\'?s?|m\.?sc|phd|degree)\b.{0,15}?(?:in|of)\s+([a-zA-Z\s]{3,40}?)(?:,|\.|and|\bor\b|with|for|[0-9]|\-)'
        match = re.search(pattern, text)
        
        if match:
            deg_type = match.group(1).strip().title()
            field = match.group(2).strip().title()
            deg_type = deg_type.replace("Bsc", "BSc").replace("Msc", "MSc").replace("Bachelor'S", "Bachelor's")
            
            if len(field.split()) <= 6:
                return f"{deg_type} in {field}"
                
        fallback_pattern = r'(?i)\b(bachelor\'?s?|bsc|master\'?s?|msc|phd)\b'
        fallback = re.search(fallback_pattern, text)
        if fallback:
            deg = fallback.group(1).title().replace("Bsc", "BSc").replace("Msc", "MSc").replace("Bachelor'S", "Bachelor's")
            return f"{deg} (Field Unspecified)"
            
        return "Not Specified / Equivalent Experience"

    def extract_skills(self, text):
        extracted = set() 
        text_lower = str(text).lower()
        
        for skill, skill_lower in zip(self.skill_dictionary, self.skill_dictionary_lower):
            if skill_lower in text_lower:
                if len(skill_lower) <= 3: 
                    if re.search(rf'\b{re.escape(skill_lower)}\b', text_lower):
                        extracted.add(skill)
                else:
                    extracted.add(skill)
                    
        return list(extracted)

    def run_pipeline(self, raw_data_folder, output_csv_path):
        print(f"\n[1/4] Scanning for raw datasets in {raw_data_folder}...")
        
        # NEW: Automatically find all CSV files in the raw folder
        all_files = glob.glob(os.path.join(raw_data_folder, "*.csv"))
        
        if not all_files:
            print(f"ERROR: No CSV files found in {raw_data_folder}.")
            return
            
        print(f"      Found {len(all_files)} raw batches. Merging...")
        dataframes = [pd.read_csv(path) for path in all_files]
        master_df = pd.concat(dataframes, ignore_index=True)
        print(f"      Initial job count: {len(master_df)}")
        
        print("\n[2/4] Executing ELT Deduplication Protocol...")
        # NEW: Drop duplicate jobs based on their exact URL
        original_count = len(master_df)
        master_df = master_df.drop_duplicates(subset=['Job URL'], keep='last')
        dupes_removed = original_count - len(master_df)
        print(f"      Removed {dupes_removed} duplicate job postings.")
        print(f"      Final unique jobs to process: {len(master_df)}")
        
        print("\n[3/4] Running Deep NLP Extraction (Degrees & Skills)...")
        master_df['Required_Degree'] = master_df['Description'].apply(self.extract_advanced_degree)
        master_df['Extracted_Skills'] = master_df['Description'].apply(self.extract_skills)
        
        # Filter out jobs where the NLP engine couldn't find ANY skills (corrupted data)
        master_df = master_df[master_df['Extracted_Skills'].map(len) > 0]
        
        clean_df = master_df[['Target_Role', 'Job Title', 'Company', 'Job URL', 'Required_Degree', 'Extracted_Skills']]
        
        print(f"\n[4/4] Calculating Delta & Saving Datasets...")
        delta_csv_path = os.path.join(os.path.dirname(output_csv_path), 'delta_new_jobs.csv')
        existing_urls = set()
        
        if os.path.exists(output_csv_path):
            try:
                existing_df = pd.read_csv(output_csv_path)
                if 'Job URL' in existing_df.columns:
                    existing_urls = set(existing_df['Job URL'].dropna().tolist())
            except Exception as e:
                print(f"      Warning: Could not read existing master CSV: {e}")
                existing_df = pd.DataFrame()
        else:
            existing_df = pd.DataFrame()

        # Delta contains records with Job URLs that do not exist in the master file yet
        delta_df = clean_df[~clean_df['Job URL'].isin(existing_urls)]
        delta_df.to_csv(delta_csv_path, index=False)
        print(f"      -> Delta dataset saved: {delta_csv_path} ({len(delta_df)} new records)")

        # Combine existing records with the new delta records
        if not existing_df.empty:
            combined_df = pd.concat([existing_df, delta_df], ignore_index=True)
            combined_df = combined_df.drop_duplicates(subset=['Job URL'], keep='last')
        else:
            combined_df = clean_df

        combined_df.to_csv(output_csv_path, index=False)
        print(f"      [OK] SUCCESS! Master dataset updated: {output_csv_path}")
        print(f"      Total cumulative validated records: {len(combined_df)}")

# --- Execution Entry Point ---
if __name__ == "__main__":
    cleaner = AdvancedNLPCleaner()
    
    # Point it to your folders!
    raw_folder = '../data/raw'
    output = '../data/cleaned_multi_role_jobs.csv'
    
    cleaner.run_pipeline(raw_folder, output)