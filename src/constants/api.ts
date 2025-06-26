export const API_BASE_URL = "https://pokeapi.co/api/v2";

// Pagination limit for listing Pokémon
export const POKEMON_LIMIT = 18;

/** Pokémon List & Detail */
export const getListUrl = (limit = POKEMON_LIMIT, offset = 0) =>
  `${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;

export const getDetailUrl = (nameOrId: string | number) =>
  `${API_BASE_URL}/pokemon/${nameOrId}`;

/** Pokémon Species (for flavor text, gender ratio, evolution chain) */
export const getSpeciesUrl = (nameOrId: string | number) =>
  `${API_BASE_URL}/pokemon-species/${nameOrId}`;

/** Evolution Chain */
export const getEvolutionChainUrl = (id: string | number) =>
  `${API_BASE_URL}/evolution-chain/${id}`;

/** Pokémon Types */
export const getAllTypesUrl = () => `${API_BASE_URL}/type`;

export const getTypeDetailUrl = (typeName: string) =>
  `${API_BASE_URL}/type/${typeName}`;

/** Pokémon Abilities */
export const getAllAbilitiesUrl = () => `${API_BASE_URL}/ability`;

export const getAbilityDetailUrl = (abilityName: string) =>
  `${API_BASE_URL}/ability/${abilityName}`;

/** Pokémon Gender */
export const getAllGendersUrl = () => `${API_BASE_URL}/gender`;

export const getGenderDetailUrl = (gender: string) =>
  `${API_BASE_URL}/gender/${gender}`;

/** Utility: Extract ID from URL (optional helper) */
export const extractIdFromUrl = (url: string): string => {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
};

