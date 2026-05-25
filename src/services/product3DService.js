/**
 * 3D Product Service
 * 
 * Maps catalog products to specific 3D model loaders (GLTF/GLB)
 * or creates state-of-the-art procedural luxury streetwear meshes (Hoodies, Sunglasses, Sneakers, Bags)
 * so that every item has an interactive, customized, high-fidelity 3D asset out-of-the-box.
 */

export const PRODUCT_3D_ASSETS = {
  // We can pre-configure 3D GLTF URLs here if available
  'phantom-cargo': {
    type: 'procedural_cargo',
    color: '#1a1a1a',
    roughness: 0.85,
    metalness: 0.1,
  },
  'obsidian-heavy-tee': {
    type: 'procedural_tee',
    color: '#0f0f11',
    roughness: 0.7,
    metalness: 0.05,
  },
  'stealth-bomber-jacket': {
    type: 'procedural_jacket',
    color: '#17171e',
    roughness: 0.3,
    metalness: 0.45,
  },
  'cloud-merino-knit': {
    type: 'procedural_knit',
    color: '#dcd9d2',
    roughness: 0.9,
    metalness: 0.0,
  }
};

/**
 * Returns the 3D model metadata for a product.
 * Automatically resolves a procedural model type based on product category if not explicitly registered.
 */
export const getProduct3DMetadata = (product) => {
  if (!product) return null;

  const idString = String(product.id);
  
  // If explicitly registered in assets map
  if (PRODUCT_3D_ASSETS[idString]) {
    return {
      id: idString,
      name: product.name,
      ...PRODUCT_3D_ASSETS[idString]
    };
  }

  // Fallback procedural resolvers based on categories
  const category = (product.category || '').toLowerCase();
  const name = (product.name || '').toLowerCase();

  if (category.includes('outerwear') || name.includes('jacket') || name.includes('vest')) {
    return {
      type: 'procedural_jacket',
      color: '#1e1e24',
      roughness: 0.4,
      metalness: 0.35,
    };
  }

  if (category.includes('t-shirt') || name.includes('tee') || name.includes('shirt') || name.includes('top')) {
    return {
      type: 'procedural_tee',
      color: '#0e0f10',
      roughness: 0.75,
      metalness: 0.05,
    };
  }

  if (category.includes('bottom') || name.includes('cargo') || name.includes('pants') || name.includes('jeans')) {
    return {
      type: 'procedural_cargo',
      color: '#121316',
      roughness: 0.8,
      metalness: 0.15,
    };
  }

  if (category.includes('knit') || name.includes('sweater') || name.includes('cardigan')) {
    return {
      type: 'procedural_knit',
      color: '#eae6df',
      roughness: 0.95,
      metalness: 0.0,
    };
  }

  // Default premium futuristic accessories geometry
  return {
    type: 'procedural_glasses',
    color: '#8b5cf6',
    roughness: 0.1,
    metalness: 0.9,
  };
};
