import { useState } from "react";

type FSMachine = {
    /**
     * The current state.
     */
    state: string;
    /**
     * Transitions the machine to a new state.
     * @param state - The current state.
     * @param event - The event that triggers the transition.
     * @returns The new state.
     */
    transition: (state: string, event: string) => string;
}


type Machine = {
    initialState: string;
    states: {
        [key: string]: {
            actions: {
                onEnter: () => void;
                onExit: () => void;
            };
            transitions: {
                [key: string]: {
                    target: string;
                    action: () => void;
                }
            }
        }
    }
}



/**
 * A simple finite state machine.
 * @param createMachine - A function that returns a machine.
 */
export default class FState {
    private _state = '';
    constructor() {
        this._state = '';
    }
    private machine(sMachine: Machine) {
        const machine: FSMachine = {
            state: sMachine.initialState,
            transition: (state: string, event: string) => {
                const currentState = sMachine.states[state];
                if (!currentState) {
                    throw new Error(`State '${state}' is not defined.`);
                }
                const transition = currentState.transitions[event];
                if (!transition) {
                    throw new Error(`Event '${event}' is not a valid event for state '${state}'`);
                }
                const transitionTarget = transition.target;
                const destinationState = sMachine.states[transitionTarget];
                transition.action();
                currentState.actions.onExit();
                destinationState.actions.onEnter();
                
                machine.state = transitionTarget;
                this._state = transitionTarget;
                return machine.state;
            }
        };
        return machine;
    }
    /**
     * Creates a new machine.
     * @param machine - A machine object.
     * @returns A machine.
     */
    createMachine<T extends Machine>(machine: T): FSMachine {
        const _machine = this.machine(machine);
        return _machine as FSMachine;
    }
    get state() {
        return this._state;
    }
}
/**
 * A React hook that returns the current state of a machine and sends events to the machine.
 * @param machine - A machine.
 * @returns an array with the current state and a function to send events to the machine.
 */
function useMachine(machine: FSMachine) {
    const [state, setState] = useState(machine.state);
    const send = (event: string) => {
        const newState = machine.transition(state, event);
        setState(newState);
    };
    const data = [state, send] as const;
    return data;
}
export { FSMachine, Machine, useMachine };