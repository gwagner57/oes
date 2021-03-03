package de.oes.core0.sim;

import java.util.function.Consumer;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Scenario {
	private Integer idCounter = 0;
	private Long durationInSimTime;
	private Model model;
	private Simulator simulator;
	private Consumer<Simulator> setupInitialState;
}
