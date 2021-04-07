package de.oes.core1.workstation;

import java.util.ArrayList;
import java.util.List;

import de.oes.core1.foundations.ExogenousEvent;
import de.oes.core1.foundations.eVENT;
import de.oes.core1.lib.Rand;
import de.oes.core1.sim.Simulator;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class PartArrival extends ExogenousEvent{
	private WorkStation workStation;
	private static int counter = 1;
	private static Long maxNmrOfEvents;
	
	public PartArrival(Simulator sim, Long occTime, Long delay, WorkStation workStation) {
		super(sim, occTime, delay);
		this.workStation = workStation;
	}

	@Override
	public Long reccurence() {
		return Rand.exponential(1.0/6.0).longValue();
	}

	@Override
	public eVENT createNextEvent() {
		if(PartArrival.maxNmrOfEvents != null
			&& PartArrival.counter >= PartArrival.maxNmrOfEvents) {
			return null;
		} else {
			PartArrival.counter++;
			Long reccurence = this.reccurence();
			return new PartArrival(this.getSim(), null, reccurence, workStation);
		}
	}

	@Override
	public List<eVENT> onEvent() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		WorkStation ws = this.getWorkStation();
		Simulator sim = this.getSim();
		// increase buffer length (add part to buffer)
		ws.incrementBufferLength();
		// update statistics
		sim.incrementStat("arrivedParts", 1);
		if (ws.getInputBufferLength().longValue() > sim.getStat().get("arrivedParts").longValue()) {
		      sim.updateStatValue("maxQueueLength", ws.getInputBufferLength());
	    }
		if(ws.getStatus().equals("AVAILABLE")) {
			followupEvents.add(new ProcessingStart(sim, 
					null, null,
					ws));
		}
		return followupEvents;
	}

	public static void setMaxNmrOfEvents(Long maxNmrOfEvents) {
		PartArrival.maxNmrOfEvents = maxNmrOfEvents;
	}

}
