import { useCallback, useEffect, useState } from "react";
import {
  API_BASE_URL,
  POKEMON_LIMIT,
  getPokemonListUrl,
  ALL_TYPES_URL,
} from "./constants/apiEndPoints";
import {
  fetchData,
  getPokemonDetailEnhanced,
  getTypeDetails,
} from "./utils/api";
import FilterPanel from "./components/organisms/FilterPanel";

const App: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [statFilter, setStatFilter] = useState<{
    stat: string | null;
    value: number | null;
  }>({ stat: null, value: null });

  const [allTypes, setAllTypes] = useState<{ name: string }[]>([]);
  const [paginatedSourceUrls, setPaginatedSourceUrls] = useState<
    string[] | null
  >(null);
  const [totalSourceItems, setTotalSourceItems] = useState(0);

  const offset = (currentPage - 1) * POKEMON_LIMIT;

  useEffect(() => {
    const fetchAllTypes = async () => {
      try {
        const response = await fetchData(ALL_TYPES_URL);
        const filteredTypes = response.results.filter(
          (type: { name: string }) =>
            type.name !== "unknown" && type.name !== "shadow"
        );
        setAllTypes(filteredTypes);
      } catch (err) {
        console.error("Failed to fetch Pokémon types for dropdown:", err);
      }
    };
    fetchAllTypes();
  }, []);

  useEffect(() => {
    const prepareTypeData = async () => {
      setCurrentPage(1);
      setPokemonList([]);
      setLoading(true);
      setError(null);
      if (selectedType) {
        try {
          const typeDetail = await getTypeDetails(selectedType);
          const urls = typeDetail.pokemon.map(
            (p: { pokemon: { url: string } }) => p.pokemon.url
          );
          setPaginatedSourceUrls(urls);
          setTotalSourceItems(urls.length);
          setHasNextPage(urls.length > POKEMON_LIMIT);
        } catch (err) {
          setError(
            "Failed to load Pokémon for selected type. " + (err.message || "")
          );
          setPaginatedSourceUrls([]);
          setTotalSourceItems(0);
          setHasNextPage(false);
          console.error("Error fetching type-specific URLs:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setPaginatedSourceUrls(null);
        setTotalSourceItems(0);
        setHasNextPage(true);
        setLoading(false);
      }
    };

    prepareTypeData();
  }, [selectedType]);

  const fetchPokemonData = useCallback(async () => {
    setLoading(true);
    setError(null);
    let fetchedRawPokemon: any[] = [];
    let effectiveTotalItems = 0;

    try {
      if (selectedType && paginatedSourceUrls === null) {
        return;
      }

      if (selectedType && paginatedSourceUrls !== null) {
        effectiveTotalItems = totalSourceItems;
        const paginatedUrlsForCurrentPage = paginatedSourceUrls.slice(
          offset,
          offset + POKEMON_LIMIT
        );

        setHasNextPage(offset + POKEMON_LIMIT < effectiveTotalItems);

        const detailedPokemonPromises = paginatedUrlsForCurrentPage.map((url) =>
          getPokemonDetailEnhanced(url)
        );
        fetchedRawPokemon = await Promise.all(detailedPokemonPromises);
      } else {
        const listUrl = getPokemonListUrl(POKEMON_LIMIT, offset);
        const response = await fetchData(listUrl);
        effectiveTotalItems = response.count;
        setHasNextPage(!!response.next);

        const detailedPokemonPromises = response.results.map(
          (p: { url: string }) => getPokemonDetailEnhanced(p.url)
        );
        fetchedRawPokemon = await Promise.all(detailedPokemonPromises);
      }

      let filteredPokemon = fetchedRawPokemon;

      if (selectedGender && selectedGender !== "all") {
        filteredPokemon = filteredPokemon.filter((pokemon) => {
          const genderRate = pokemon.species_data?.gender_rate;

          if (selectedGender === "male") {
            return genderRate !== -1 && genderRate < 8;
          } else if (selectedGender === "female") {
            return genderRate !== -1 && genderRate > 0;
          } else if (selectedGender === "genderless") {
            return genderRate === -1;
          }
          return true;
        });
      }

      if (
        statFilter.stat &&
        statFilter.value !== null &&
        statFilter.value >= 0
      ) {
        filteredPokemon = filteredPokemon.filter((pokemon) => {
          const stat = pokemon.stats.find(
            (s: { stat: { name: string }; base_stat: number }) =>
              s.stat.name === statFilter.stat
          );
          return stat && stat.base_stat >= statFilter.value;
        });
      }

      setPokemonList(filteredPokemon);
    } catch (err) {
      setError(
        "Failed to load Pokémon data. Please try again. " + (err.message || "")
      );
      setPokemonList([]);
      setHasNextPage(false);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [
    offset,
    selectedGender,
    statFilter,
    selectedType,
    paginatedSourceUrls,
    totalSourceItems,
  ]);

  useEffect(() => {
    if (
      selectedType === null ||
      (selectedType && paginatedSourceUrls !== null)
    ) {
      fetchPokemonData();
    }
  }, [fetchPokemonData, selectedType, paginatedSourceUrls]);

  const handleNextPage = () => {
    if (!loading && hasNextPage) {
      setCurrentPage((prevPage) => prevPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePreviousPage = () => {
    if (!loading && currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = event.target.value === "all" ? null : event.target.value;
    setSelectedType(newType);
  };

  const handleGenderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGender(event.target.value === "all" ? null : event.target.value);
    setCurrentPage(1);
  };

  const handleStatChange = (statName: string | null, value: number | null) => {
    setStatFilter({ stat: statName, value: value });
    setCurrentPage(1);
  };

  return (
    <div>
      <h1>Pokedox App</h1>

      <FilterPanel
        allTypes={allTypes}
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        selectedGender={selectedGender}
        onGenderChange={handleGenderChange}
        statFilter={statFilter}
        onStatChange={handleStatChange}
      />

      {loading && pokemonList.length === 0 && <p>Loading Pokemon...</p>}

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-full max-w-xl text-center mb-4"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {!loading && !error && pokemonList.length === 0 && (
        <p>No Pokémon found with the selected filters.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl mb-8">
        {pokemonList.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>

      <div className="flex justify-center items-center gap-4 py-4 w-full max-w-6xl">
        <Button
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || loading}
          className="flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
          Previous
        </Button>
        <Text type="span" className="text-lg font-semibold text-gray-800">
          Page {currentPage}
        </Text>
        <Button
          onClick={handleNextPage}
          disabled={!hasNextPage || loading}
          className="flex items-center"
        >
          Next
          <svg
            className="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </Button>
      </div>

      {loading && pokemonList.length > 0 && (
        <p>
          Fetching more Pokémon...
        </p>
      )}
      {!loading && !hasNextPage && pokemonList.length > 0 && (
        <p>
          You've reached the end of the Pokémon list!
        </p>
      )}
    </div>
  );
};

export default App;
