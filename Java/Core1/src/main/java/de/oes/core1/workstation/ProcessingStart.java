package de.oes.core1.workstation;

import java.util.ArrayList;
import java.util.List;

import de.oes.core1.foundations.eVENT;
import de.oes.core1.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProcessingStart extends eVENT{

	private WorkStation workStation;
	
	public ProcessingStart(Simulator sim, Number occTime, Number delay, WorkStation workStation) {
		super(sim, occTime, delay);
		this.workStation = workStation;
	}

	@Override
	public List<eVENT> onEvent() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		WorkStation ws = this.workStation;
		ws.setStatus("BUSY");
		// schedule the processing end event
		followupEvents.add(new ProcessingEnd(
				getSim(), 
				null, //occTime
				WorkStation.processingTime(), //delay
				ws));
		return followupEvents;
	}

}
