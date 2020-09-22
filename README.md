# Object Event Simulators 
This project provides various ***simulators*** (or *simulation engines*) for *Object Event Simulation (OES)*,
which is a *Discrete Event Simulation* paradigm combining object-oriented modeling with the simulation approach of 
*event scheduling*.

For simplicity, all of these simulators have a minimalistic user interface.

The minimal version of an Object Event Simulator is *OES Core 0* with about 220 lines of code in JavaScript,
supporting models with (global) model variables and functions, object types, event types, and simple simulation experiments. 

The simulators OES Core 1-4 incrementally extend OES Core 0 by adding further features:

1. OES Core 1 adds a seedable random number generator, a set of sampling functions from various probability distributions 
(uniform, triangular, normal, exponential, etc.), multiple scenarios per model, multiple experiment types per model, model parameters, 
parameter variation experiments, as well as persistent storage and export of experiment results.

2. OES Core 2 adds the concept of *activities*, which are composite events that have some duration and typically depend on resources,
together with the concepts of *resource roles*, *resource constraints* and *resource pools*. For an activity-based simulation model,
the simulator can automatically compute (a) throughput, (b) queue length, (c) cycle time, and (d) resource utilization statistics per activity type.

3. OES Core 3 adds the concepts of *processing activities* and *processing networks*.

4. OES Core 4 adds the concept of *agents*.

You can run OESjs Core simulation examples from [the project website](https://gwagner57.github.io/oes/).

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
- persistent storage and export of experiment results 

<figure><figcaption>The OES Core 1 information architecture</figcaption>
 <img src="docs/OES-Core1.svg">
</figure>

## OES Core 2

OES Core 2 adds the following features to OES Core 1:

- activities as composite events, having a start event and an end event, and a duration as the time in-between their start and end events
- resource roles with resource constraints
- resource pools
- automated (a) throughput, (b) queue length, (c) cycle time, and (d) resource utilization statistics per activity type

<figure><figcaption>The OES Core 2 information architecture</figcaption>
 <img src="docs/OES-Core2.svg">
</figure>