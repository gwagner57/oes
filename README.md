# Object Event Simulators 
This project provides various ***simulators*** (or *simulation engines*) for *Object Event Simulation (OES)*,
which is a *Discrete Event Simulation* paradigm combining object-oriented modeling with the simulation approach of 
*event scheduling*.

For simplicity, all of these simulators have a minimalistic user interface.

The minimal version of an Object Event Simulator is *OES Core 0* with about 220 lines of code in JavaScript. 

The simulators OES Core 1-3 incrementally extend OES Core 0 by adding further features.

You can run OESjs Core0 and Core1 simulation examples from [the project website](https://gwagner57.github.io/oes/).

## OES Core 0

OES Core 0 is the minimal architecture for an OE simulator, supporting  

- model variables 
- object types and event types (including exogenous event types with recurrence/nextEvent functions)
- next-event time progression
- the uniform distribution as the only representative of probability distributions
- simple simulation experiments with the (unseeded) random number generator provided by the host programming language.

<figure><figcaption>The OES Core 0 information architecture</figcaption>
 <img src="docs/OES-Core0.svg">
</figure>

<figure><figcaption>The OES Core 0 simulator algorithm</figcaption>
 <img src="docs/OES-Core0-runStandaloneScenario.svg">
</figure>

## OES Core 1

OES Core 1 adds the following features to OES Core 0:

- fixed-increment time progression
- a seedable random number generator
- a set of sampling functions from various probability distributions (uniform, triangular, normal, exponential, etc.)
- multiple scenarios per model
- multiple experiment types per model
- model parameters 
- parameter variation experiments
- persistent storage of experiment results 

<figure><figcaption>The OES Core 1 information architecture</figcaption>
 <img src="docs/OES-Core1.svg">
</figure>