package de.oes.core1.workstation;

import java.util.ArrayList;
import java.util.List;

import de.oes.core1.foundations.eVENT;
import de.oes.core1.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProcessingEnd extends eVENT{
	
	private WorkStation workStation;
	
	public ProcessingEnd(Simulator sim, Number occTime, Number delay, WorkStation workStation) {
		super(sim, occTime, delay);
		this.workStation = workStation;
	}

	@Override
	public List<eVENT> onEvent() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		WorkStation ws = this.workStation;
		Simulator sim = this.getSim();
		// decrease buffer length (remove part from buffer)
		ws.decrementBufferLength();
		// update statistics
		sim.incrementStat("departedParts", 1);
		// if there are still parts waiting
		if (ws.getInputBufferLength() > 0) {
	      // schedule the next processing start event
	      followupEvents.add( new ProcessingStart(sim, null, null, ws));
	    } else {  // buffer empty
	      ws.setStatus("AVAILABLE");
	    }
	    return followupEvents;
	}

}
