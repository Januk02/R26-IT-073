import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, X, Loader2, Info } from 'lucide-react';
import axios from 'axios';
import API from '../../../config/api';
import './DegreeInput.css';

export default function DegreeInput({ onDegreeChange, resetKey }) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setInputValue('');
    setSuggestions([]);
    setIsSelected(false);
  }, [resetKey]);

  useEffect(() => {
    if (isSelected) return;

    const delayDebounceFn = setTimeout(async () => {
      if (inputValue.trim().length >= 2) {
        setIsLoading(true);
        try {
          const response = await axios.get(API.SUGGEST_DEGREES, {
            params: { q: inputValue.trim() },
            timeout: 3000,
          });
          setSuggestions(response.data.suggestions || []);
        } catch (error) {
          console.log('Degree suggestion API unavailable');
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(delayDebounceFn);
  }, [inputValue, isSelected]);

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

  const selectDegree = (degree) => {
    setInputValue(degree);
    setSuggestions([]);
    setIsSelected(true);
    onDegreeChange(degree);
  };

  const handleTextChange = (e) => {
    setInputValue(e.target.value);
    setIsSelected(false);
    onDegreeChange(e.target.value);
  };

  const clearDegree = () => {
    setInputValue('');
    setSuggestions([]);
    setIsSelected(false);
    onDegreeChange('');
  };

  return (
    <div className="degree-input-container" ref={containerRef}>
      <div className={`degree-input-wrapper ${isFocused ? 'focused' : ''} ${isSelected ? 'selected' : ''}`}>
        <GraduationCap size={18} className="degree-icon" />
        <input
          type="text"
          className="degree-input"
          value={inputValue}
          onChange={handleTextChange}
          onFocus={() => setIsFocused(true)}
          placeholder="e.g. BSc in IT, Master in CS..."
          id="degree-input-field"
        />
        {isLoading && <Loader2 size={18} className="degree-spinner" />}
        {isSelected && (
          <button className="degree-clear" onClick={clearDegree} aria-label="Clear degree">
            <X size={16} />
          </button>
        )}
      </div>

      {!isSelected && inputValue.trim().length >= 2 && (
        <div className="degree-hint">
          <Info size={12} />
          <span>Tip: "BSc", "MSc", "CS" all work — we'll match it!</span>
        </div>
      )}

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            className="degree-suggestions"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {suggestions.map((item, index) => (
              <button
                key={index}
                className="degree-suggestion-item"
                onClick={() => selectDegree(item)}
              >
                <GraduationCap size={14} className="degree-suggestion-icon" />
                <span>{item}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
