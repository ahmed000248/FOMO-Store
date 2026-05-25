/**
 * React hook useRecommendations
 * 
 * Coordinates the full suite of AI-powered recommendation sliders
 * for the currently active product being viewed.
 */
import { useState, useEffect } from 'react';
import { useProducts } from './useProducts';
import { useRecentlyViewed } from './useRecentlyViewed';
import {
  getStyledForYou,
  getCompleteTheFit,
  getRecommendedEssentials
} from '../services/recommendationService';

export const useRecommendations = (currentProduct) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Recommendations states
  const [styledForYou, setStyledForYou] = useState([]);
  const [completeTheFit, setCompleteTheFit] = useState([]);
  const [recommendedEssentials, setRecommendedEssentials] = useState([]);
  
  // Fetch all items to build intelligence on top of
  const { allProducts, loading: productsLoading, error: productsError } = useProducts({});
  const { recentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    if (!currentProduct) {
      setLoading(false);
      return;
    }

    if (productsLoading) {
      setLoading(true);
      return;
    }

    if (productsError) {
      setError(productsError);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Artificial delay (500ms) for high-end cinematic UX skeleton loaders
      const timer = setTimeout(() => {
        if (allProducts && allProducts.length > 0) {
          const styled = getStyledForYou(currentProduct, allProducts, recentlyViewed);
          const outfit = getCompleteTheFit(currentProduct, allProducts);
          const essentials = getRecommendedEssentials(currentProduct, allProducts);

          setStyledForYou(styled);
          setCompleteTheFit(outfit);
          setRecommendedEssentials(essentials);
        }
        setLoading(false);
      }, 550);

      return () => clearTimeout(timer);
    } catch (err) {
      console.error("AI Recommendations calculation failure", err);
      setError(err);
      setLoading(false);
    }
  }, [currentProduct, allProducts, productsLoading, productsError, recentlyViewed.length]);

  return {
    loading,
    error,
    styledForYou,
    completeTheFit,
    recommendedEssentials
  };
};
