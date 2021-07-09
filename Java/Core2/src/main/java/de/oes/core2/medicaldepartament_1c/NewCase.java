package de.oes.core2.medicaldepartament_1c;

import java.util.ArrayList;

import java.util.List;
import de.oes.core2.foundations.ExogenousEvent;
import de.oes.core2.foundations.eVENT;
import de.oes.core2.lib.Rand;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NewCase extends ExogenousEvent {

	public NewCase(Simulator sim, Number occTime, Number delay, Number startTime, Number duration) {
		super(sim, occTime, delay, startTime, duration);
	}
	
	@Override
	public List<eVENT> onEvent() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		return followupEvents;
	}

	@Override
	public String getSuccessorActivity() {
		return "Examination";
	}

	@Override
	public Number reccurence() {
		return Rand.exponential(0.3);
	}

	@Override
	public eVENT createNextEvent() {
		return new NewCase(this.getSim(), null, this.reccurence(), null, null);
	}

}
