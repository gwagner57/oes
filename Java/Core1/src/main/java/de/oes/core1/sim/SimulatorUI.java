package de.oes.core1.sim;

import java.util.ArrayList;
import java.util.List;


import de.oes.core1.dto.LogEntryDTO;
import de.oes.core1.foundations.eVENT;

public class SimulatorUI {

	private static List<LogEntryDTO> logs;
	
	public static void clearLogs() {
		logs = new ArrayList<LogEntryDTO>();
	}
	
	public static void logSimulationStep(Simulator sim) {
	  System.out.println("\n-------------------- Log Simulation Step " + sim.getStep() + " ---------------------------");
	    System.out.println("Step Information *******************************************************");
	    System.out.println("-> Step:" + sim.getStep() + " Time:" + sim.getTime() + " End Time:" + sim.getEndTime());
	    
	    System.out.println("\nObject Information *****************************************************");
	    System.out.println (sim.getObjects());
	    
	    System.out.println("\nEvent Information ******************************************************");
	    String futureEvents = "";
	    for(eVENT e : sim.getFEL().getEvents()) {
	    	System.out.println(e);
	    	futureEvents += e.toString() + "\n";
	    }
	    logs.add(LogEntryDTO.builder().
	    				  withSimStep(sim.getStep()).
	    				  withTime(sim.getTime()).
	    				  withSystemState(sim.getObjects().toString()).
	    				  withFutureEvents(futureEvents).
	    				  build());
	}

	public static List<LogEntryDTO> getLogs() {
		return logs;
	}
}
