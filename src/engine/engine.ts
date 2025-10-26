export interface PokemonInfo {
    id: number;
    name: string;
    type: string[];
    generation: number;
    habitat: string;
    is_legendary: boolean;
    evolves_from: string | null;
    evolves_to: string[] | null;
    shape: string;
    notable_trait: string;
};

const query_traits: (keyof PokemonInfo)[] = [
    'type',
    'generation',
    'habitat',
    'is_legendary',
    'evolves_from',
    'evolves_to',
    'shape',
    'notable_trait'
];

type PokemonFilter = (pokemon: PokemonInfo[]) => PokemonInfo[];

export interface PokemonQuestion {
    trait(): keyof PokemonInfo;
    question(): string;
    filter(answer: boolean): PokemonFilter;
    equals(other: PokemonQuestion): boolean;
};

class TypeTraitQuestion implements PokemonQuestion {
    private type: string;

    constructor(type: string) {
        this.type = type;
    }

    public trait(): keyof PokemonInfo {
        return 'type';
    }

    public question(): string {
        return `Is the Pokemon of type ${this.type}?`;
    }

    public filter(answer: boolean): PokemonFilter {
        return (pokemons: PokemonInfo[]) => {
            return pokemons.filter(pokemon => {
                const hasType = pokemon.type.includes(this.type);
                return answer ? hasType : !hasType;
            });
        };
    }

    public equals(other: PokemonQuestion): boolean {
        if (other instanceof TypeTraitQuestion) {
            return other.type == this.type;
        }

        return false;
    }
};

class GenerationTraitQuestion implements PokemonQuestion {
    private generation: number;

    constructor(generation: number) {
        this.generation = generation;
    }

    public trait(): keyof PokemonInfo {
        return 'generation';
    }

    public question(): string {
        return `Is the Pokemon from generation ${this.generation}?`;
    }

    public filter(answer: boolean): PokemonFilter {
        return (pokemons: PokemonInfo[]) => {
            return pokemons.filter(pokemon => {
                const isFromGeneration = pokemon.generation === this.generation;
                return answer ? isFromGeneration : !isFromGeneration;
            });
        };
    }

    public equals(other: PokemonQuestion): boolean {
        if (other instanceof GenerationTraitQuestion) {
            return other.generation == this.generation;
        }

        return false;
    }
};

class HabitatTraitQuestion implements PokemonQuestion {
    private habitat: string;

    constructor(habitat: string) {
        this.habitat = habitat;
    }

    public trait(): keyof PokemonInfo {
        return 'habitat';
    }

    public question(): string {
        return `Does the Pokemon live in the ${this.habitat} habitat?`;
    }

    public filter(answer: boolean): PokemonFilter {
        return (pokemons: PokemonInfo[]) => {
            return pokemons.filter(pokemon => {
                const isInHabitat = pokemon.habitat === this.habitat;
                return answer ? isInHabitat : !isInHabitat;
            });
        };
    }

    public equals(other: PokemonQuestion): boolean {
        if (other instanceof HabitatTraitQuestion) {
            return other.habitat == this.habitat;
        }

        return false;
    }
};

class LegendaryTraitQuestion implements PokemonQuestion {
    public trait(): keyof PokemonInfo {
        return 'is_legendary';
    }

    public question(): string {
        return `Is the Pokemon legendary?`;
    }

    public filter(answer: boolean): PokemonFilter {
        return (pokemons: PokemonInfo[]) => {
            return pokemons.filter(pokemon => {
                return answer ? pokemon.is_legendary : !pokemon.is_legendary;
            });
        };
    }

    public equals(other: PokemonQuestion): boolean {
        if (other instanceof LegendaryTraitQuestion) {
            return true;
        }

        return false;
    }
};

class EvolutionTraitQuestion implements PokemonQuestion {
    private evolves_from: boolean;
    private evolution: string;

    constructor(evolves_from: boolean, evolution: string) {
        this.evolves_from = evolves_from;
        this.evolution = evolution;
    }

    public trait(): keyof PokemonInfo {
        return this.evolves_from ? 'evolves_from' : 'evolves_to';
    }

    public question(): string {
        return this.evolves_from ?
            `Does the Pokemon evolve from ${this.evolution}?` :
            `Does the Pokemon evolve to ${this.evolution}?`;
    }

    public filter(answer: boolean): PokemonFilter {
        return (pokemons: PokemonInfo[]) => {
            return pokemons.filter(pokemon => {
                const evolvesCorrectly = this.evolves_from ?
                    pokemon.evolves_from === this.evolution :
                    pokemon.evolves_to?.find(evolution => evolution === this.evolution) !== undefined;
                return answer ? evolvesCorrectly : !evolvesCorrectly;
            });
        };
    }

    public equals(other: PokemonQuestion): boolean {
        if (other instanceof EvolutionTraitQuestion) {
            return other.evolution == this.evolution && other.evolves_from == this.evolves_from;
        }

        return false;
    }
};

class ShapeTraitQuestion implements PokemonQuestion {
    private shape: string;

    constructor(shape: string) {
        this.shape = shape;
    }

    public trait(): keyof PokemonInfo {
        return 'shape';
    }

    public question(): string {
        return `Is the Pokemon a ${this.shape}?`;
    }

    public filter(answer: boolean): PokemonFilter {
        return (pokemons: PokemonInfo[]) => {
            return pokemons.filter(pokemon => {
                const hasShape = pokemon.shape === this.shape;
                return answer ? hasShape : !hasShape;
            });
        };
    }

    public equals(other: PokemonQuestion): boolean {
        if (other instanceof ShapeTraitQuestion) {
            return other.shape == this.shape;
        }

        return false;
    }
};

class NotableTraitQuestion implements PokemonQuestion {
    private notable_trait: string;

    constructor(notable_trait: string) {
        this.notable_trait = notable_trait;
    }

    public trait(): keyof PokemonInfo {
        return 'notable_trait';
    }

    public question(): string {
        return `Is the Pokemon notable for:\n ${this.notable_trait}?`;
    }

    public filter(answer: boolean): PokemonFilter {
        return (pokemons: PokemonInfo[]) => {
            return pokemons.filter(pokemon => {
                const hasNotableTrait = pokemon.notable_trait === this.notable_trait;
                return answer ? hasNotableTrait : !hasNotableTrait;
            });
        };
    }

    public equals(_: PokemonQuestion): boolean {
        return false; // It is impossible for a trait like this to repeat.
    }
};

export class Engine {
    private current_guess: number;
    private pokemons: PokemonInfo[];
    private filtered_pokemons: PokemonInfo[];
    private filters: PokemonFilter[] = [];
    private previous_questions: PokemonQuestion[];
    private current_question: PokemonQuestion;

    constructor(pokemons: PokemonInfo[]) {
        this.pokemons = pokemons;
        this.filtered_pokemons = pokemons;
        this.previous_questions = [];
        this.current_guess = Math.random() * pokemons.length | 0;
        this.current_question = this.generateQuestion();
    }

    private checkUnique(question: PokemonQuestion) {
        for (const other of this.previous_questions) {
            if (other.equals(question)) {
                return false;
            }
        }

        return true;
    }

    private randomQuestion(): PokemonQuestion {
        const trait = query_traits[Math.random() * query_traits.length | 0];
        const pokemon = this.filtered_pokemons[this.current_guess];

        switch (trait) {
            case 'type': {
                const possible_types = pokemon.type;
                const type = possible_types[Math.random() * possible_types.length | 0];
                return new TypeTraitQuestion(type);
            }
            case 'generation':
                return new GenerationTraitQuestion(pokemon.generation);
            case 'habitat':
                return new HabitatTraitQuestion(pokemon.habitat);
            case 'is_legendary':
                return new LegendaryTraitQuestion();
            case 'evolves_from':
                if (pokemon.evolves_from) {
                    return new EvolutionTraitQuestion(true, pokemon.evolves_from);
                } else {
                    return this.generateQuestion();
                }
            case 'evolves_to':
                if (pokemon.evolves_to && pokemon.evolves_to.length > 0) {
                    const evolvesTo = pokemon.evolves_to[Math.random() * pokemon.evolves_to.length | 0];
                    return new EvolutionTraitQuestion(false, evolvesTo);
                } else {
                    return this.generateQuestion();
                }
            case 'shape':
                return new ShapeTraitQuestion(pokemon.shape);
            case 'notable_trait':
                return new NotableTraitQuestion(pokemon.notable_trait);
            default:
                throw new Error(`Unknown trait: ${trait}`);
        }
    }

    private generateQuestion(): PokemonQuestion {
        let question = this.randomQuestion();
        while (!this.checkUnique(question)) {
            question = this.generateQuestion();
        }

        return question;
    }

    public getPossiblePokemons(): PokemonInfo[] {
        let possible_pokemons = this.pokemons;

        for (const filter of this.filters) {
            possible_pokemons = filter(possible_pokemons);
        }

        return possible_pokemons;
    }

    public getQuestion(): PokemonQuestion {
        return this.current_question;
    }

    public getCurrentGuess(): PokemonInfo {
        return this.filtered_pokemons[this.current_guess];
    }

    public getPossibleRatio(): [number, number] {
        return [this.filtered_pokemons.length, this.pokemons.length];
    }

    public answerQuestion(answer: boolean) {
        const filter = this.current_question.filter(answer);
        this.filtered_pokemons = filter(this.filtered_pokemons);
        this.filters.push(filter);
        this.previous_questions.push(this.current_question);

        if (this.filtered_pokemons.length > 0) {
            this.current_guess = Math.random() * this.filtered_pokemons.length | 0;
            this.current_question = this.generateQuestion();
        }
    }

    public skipQuestion() {
        this.current_question = this.generateQuestion();
    }
};