import axios from "axios";
import { useEffect, useState } from "react";

const List: React.FC = () => {
  const [list, setList] = useState([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 18;

  useEffect(() => {
    const getPok = async () => {
      setLoading(true);
      setError(null);
      try {
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon?limit=${ITEMS_PER_PAGE}&offset=${offset}`
        );
        const names = response.data.results.map(
          (pokemon: { name: string }) => pokemon.name
        );
        setList(names);
      } catch (error) {
        setError("Error fetching Pokémon data");
        console.error("error fetching", error);
      } finally {
        setLoading(false);
      }
    };

    getPok();
  }, [currentPage]);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <>
      <h1>Making List</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <ul>
        {list.map((name, index) => (
          <li key={index}>{name}</li>
        ))}
      </ul>
      <div>
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <button onClick={handleNextPage}>Next</button>
      </div>
    </>
  );
};

export default List;
