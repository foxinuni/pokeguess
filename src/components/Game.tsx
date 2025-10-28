import { createSignal } from 'solid-js'
import { Engine } from '../engine/engine.ts'
import pokemons from '../data/pokemons.json'
import WinModal from './WinModal.tsx'

import './Game.css'

function Game() {
    const [engine, setEngine] = createSignal(new Engine(pokemons))
    const [count, setCount] = createSignal(0)
    const [tick, setTick] = createSignal(0)
    const [showWinModal, setShowWinModal] = createSignal(false)
    const [guessedPokemon, setGuessedPokemon] = createSignal<{name: string, id: number} | null>(null)

    const getCurrentGuess = () => {
        tick()
        return engine().getCurrentGuess()
    }

    const getPossibilities = () => {
        tick()
        return engine().getPossibleRatio();
    }

    const getQuestion = () => {
        tick()
        setCount(c => c + 1);
        return engine().getQuestion()
    }

    const answer = (yes: boolean) => {
        engine().answerQuestion(yes)

        if (engine().getPossiblePokemons().length === 1) {
            const pokemon = engine().getPossiblePokemons()[0]
            setGuessedPokemon({ name: pokemon.name, id: pokemon.id })
            setShowWinModal(true)
        } else if (engine().getPossiblePokemons().length === 0) {
            alert("I couldn't guess your Pokemon. Are you sure it's in my database?")
        }

        setTick(t => t + 1)
    }

    const skip = () => {
        engine().skipQuestion()
        setTick(t => t + 1)
    }

    const resetGame = () => {
        setEngine(new Engine(pokemons))
        setCount(0)
        setTick(0)
        setShowWinModal(false)
        setGuessedPokemon(null)
    }

    const getSprite = (id: number): string => {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
    }

    return (
        <>
            <div class="game">
                <div class="header">
                    <h1 class="title">PokeGuess</h1>
                    <h2>Think of a Pokemon and I'll try to guess it!</h2>
                </div>
                <div class="status">
                    <p class="bubble">Current Guess ({getPossibilities()[0]} possibilities)</p>
                    <div class="display">
                        <img alt="Pokemon Guess" src={getSprite(getCurrentGuess().id)}></img>
                    </div>
                    <div class="progression">
                        <span class="progress-info">
                            <p class="left">Progress</p>
                            <p class="right">Question: {count()}</p>
                        </span>
                        <progress value={100 * (1 - getPossibilities()[0] / getPossibilities()[1])} max="100"></progress>
                    </div>
                </div>
                <div class="form">
                    <div class="question">
                        <p>{getQuestion().question()}</p>
                    </div>
                    <span class="answers">
                        <button class="accept" onClick={() => answer(true)}>Yes</button>
                        <button class="deny" onClick={() => answer(false)}>No</button>
                        <button onClick={() => skip()}>Skip</button>
                    </span>
                </div>
            </div>
            
            <WinModal 
                show={showWinModal()}
                pokemonName={guessedPokemon()?.name || ''}
                pokemonId={guessedPokemon()?.id || 0}
                questionCount={count()}
                onClose={resetGame}
            />
        </>
    )
}

export default Game;