import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useCategories() {
  const { userId } = useAuth();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE_URL}/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.categories) setCategories(data.categories);
      })
      .catch(console.error);
  }, [userId]);

  const saveCategories = async (newCats) => {
    setCategories(newCats); // Optimistic UI update
    try {
      await fetch(`${API_BASE_URL}/api/users/${userId}/categories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: newCats })
      });
    } catch (error) {
      console.error('Failed to save categories', error);
    }
  };

  return { categories, saveCategories };
}