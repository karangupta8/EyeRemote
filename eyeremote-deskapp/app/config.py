"""
Configuration management for EyeRemote application
Handles saving and loading user preferences
"""

import json
import os
from typing import Any, Dict

class Config:
    def __init__(self, config_file: str = "eyeremote_config.json"):
        """
        Initialize configuration manager
        
        Args:
            config_file: Path to configuration file
        """
        self.config_file = config_file
        self.config_data = self._load_default_config()
        self.load()
        
    def _load_default_config(self) -> Dict[str, Any]:
        """Load default configuration values"""
        return {
            'timeout': 3,
            'max_faces': 1,
            'target_app': 'Any',
            'camera_index': 0,
            'eye_ar_threshold': 0.25,
            'window_geometry': '600x500',
            'always_on_top': False,
            'minimize_to_tray': True
        }
        
    def load(self):
        """Load configuration from file"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    loaded_config = json.load(f)
                    # Merge with defaults to handle new config options
                    self.config_data.update(loaded_config)
        except Exception as e:
            print(f"Warning: Could not load config file: {e}")
            
    def save(self):
        """Save configuration to file"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config_data, f, indent=2)
        except Exception as e:
            print(f"Warning: Could not save config file: {e}")
            
    def get(self, key: str, default: Any = None) -> Any:
        """
        Get configuration value
        
        Args:
            key: Configuration key
            default: Default value if key not found
            
        Returns:
            Configuration value or default
        """
        return self.config_data.get(key, default)
        
    def set(self, key: str, value: Any):
        """
        Set configuration value
        
        Args:
            key: Configuration key
            value: Value to set
        """
        self.config_data[key] = value
        
    def reset_to_defaults(self):
        """Reset configuration to default values"""
        self.config_data = self._load_default_config()
        self.save()
        
    def export_config(self, filepath: str):
        """Export configuration to specified file"""
        try:
            with open(filepath, 'w') as f:
                json.dump(self.config_data, f, indent=2)
        except Exception as e:
            raise Exception(f"Could not export config: {e}")
            
    def import_config(self, filepath: str):
        """Import configuration from specified file"""
        try:
            with open(filepath, 'r') as f:
                imported_config = json.load(f)
                self.config_data.update(imported_config)
                self.save()
        except Exception as e:
            raise Exception(f"Could not import config: {e}")
