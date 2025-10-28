import { Show } from 'solid-js'
import './WinModal.css'

interface WinModalProps {
    show: boolean;
    pokemonName: string;
    pokemonId: number;
    questionCount: number;
    onClose: () => void;
}

function WinModal(props: WinModalProps) {
    const getSprite = (id: number): string => {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
    }

    return (
        <Show when={props.show}>
            <div class="modal-overlay" onClick={props.onClose}>
                <div class="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div class="modal-header">
                        <h2>🎉 I guessed it! 🎉</h2>
                    </div>
                    <div class="modal-body">
                        <div class="pokemon-reveal">
                            <img 
                                src={getSprite(props.pokemonId)} 
                                alt={props.pokemonName}
                                class="pokemon-image"
                            />
                        </div>
                        <h1 class="pokemon-name">{props.pokemonName}</h1>
                        <p class="stats">Guessed in {props.questionCount} questions!</p>
                    </div>
                    <div class="modal-footer">
                        <button class="play-again" onClick={props.onClose}>
                            Play Again
                        </button>
                    </div>
                </div>
            </div>
        </Show>
    )
}

export default WinModal