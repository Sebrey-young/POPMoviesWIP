import React, { useEffect, useState} from 'react'
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import { useDebounce } from "react-use";
import { updateSearchCount } from "./appwrite.js";

//API - Application Programming Interface- a set of rules that allows one software application to talk to another, in this case we are using TMDB API to get a list of their movies
const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState( '');
    const [movieList, setMovieList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debounceSearchTerm, setDebounceSearchTerm] = useState('');

    //Debounce the search term to prevent making too many API requests
    // by waiting for the user to stop typing for 500ms
    useDebounce(() => setDebounceSearchTerm(searchTerm), 500, [searchTerm]);
    //doing this we build an optimized search solution that improves performance by debouncing the input field

    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('');
        try{
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }

            const data = await response.json();

            if(data.Response === 'False'){
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }

            setMovieList(data.results || []);

            if(query && data.results.length > 0){
                await updateSearchCount(query, data.results[0]);
            }
        } catch (error) {
            console.error(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies. Please try again later.');

        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchMovies(debounceSearchTerm);
    }, [debounceSearchTerm]);

    return (
        <main>
            <div className="pattern "/>

            <div className="wrapper">
                <header>
                    <img src="./hero.png" alt="Hero Banner" />
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

                    {/* Search Props */}
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                <section className="all-movies">
                    <h2 className="mt-[40px]">All Movies</h2>

                    {isLoading ? (
                        <Spinner />
                    ) :errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ) : (
                        <ul>
                            {movieList.map(movie => (
                                <MovieCard key={movie.id} movie={movie}/>
                            ))}
                        </ul>
                    )}
                </section>

            </div>
        </main>
    )
}
export default App
