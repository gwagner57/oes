package de.oes.core0.servicedesk1;

import de.oes.core0.foundations.oBJECT;
import de.oes.core0.lib.MathLib;
import de.oes.core0.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServiceDesk extends oBJECT{
	private Long queueLength;
	public ServiceDesk(Integer id, String name, Simulator sim, Long queueLength) {
		super(id, name, sim);
		this.queueLength = queueLength;
	}

	public static int serviceTime() {
		int r = MathLib.getUniformRandomInteger(0, 99);
		if( r < 30) return 2; // probability 0.30
		else if (r < 80) return 3; // probability 0.50
		else return 4; // probability 0.20
	}
}
