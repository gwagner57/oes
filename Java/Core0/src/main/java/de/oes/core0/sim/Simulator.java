package de.oes.core0.sim;

import java.util.HashMap;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.function.Function;

import de.oes.core0.endpoint.ui.ExperimentsStatisticsDTO;
import de.oes.core0.foundations.ExogenousEvent;
import de.oes.core0.foundations.eVENT;
import de.oes.core0.foundations.oBJECT;
import de.oes.core0.lib.EventList;
import de.oes.core0.lib.MathLib;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Simulator {

	private Integer step = 0;
	private Double time = Double.valueOf(0);
	private Long endTime = 0l;
	private Integer idCounter = 1000;
	private Long nextMomentDeltaT = 1l;
	private Model model;
	private ExperimentType experimentType;
	private Scenario scenario = new Scenario();
	private EventList FEL = new EventList();
	private Map<Integer, oBJECT> objects = new HashMap<Integer, oBJECT>();
	private Map<String, Number> stat = new HashMap<String, Number>();
	private Double nextEvtTime = Double.valueOf(0);
	
	public void incrementStat(String name, Number inc) {
		Number num = this.stat.get(name);
		this.stat.replace(name, num, num.doubleValue() + inc.doubleValue());
	}
	
	public void updateStatValue(String name, Number newNumber) {
		Number num = this.stat.get(name);
		this.stat.replace(name, num, newNumber);
	}
	
	/*
	 ******************************************************************
	 * Initialize Simulator ********************************************
	 *******************************************************************
	 */
	public void initializeSimulator() {
		if(this.model.getTime() == Time.DISCR) {
			this.nextMomentDeltaT = 1l;
		} else {
			this.nextMomentDeltaT = 2l;
		}
	}
	
	/*
	 ******************************************************************
	 * Initialize a (standalone or experiment scenario) simulation run *
	 ******************************************************************
	 */
	public void initializeScenarioRun() {
		// clear initial state data structures
		this.objects.clear();
		this.FEL.clear();
		this.step = 0; // simulation loop step counter
		this.time = Double.valueOf(0); // simulation time
		// set default endTime
		this.endTime = this.scenario.getDurationInSimTime() != null? this.scenario.getDurationInSimTime() : Long.MAX_VALUE;
		// get ID counter from simulation scenario, or set to default value
		this.idCounter = this.scenario.getIdCounter() != null? this.scenario.getIdCounter() : Integer.MAX_VALUE;
		// set up initial state
		if (this.scenario.getSetupInitialState() != null) this.scenario.getSetupInitialState().accept(this);
		if (this.model.getSetupStatistics() != null) this.model.getSetupStatistics().accept(this);
	}
	
	public void advanceSimulationTime() {
		this.nextEvtTime = this.getFEL().getNextOccurrenceTime(); // 0 if there is no next event
		// increment the step counter
		this.step++;
		
		 // advance simulation time
		if(this.getNextEvtTime() > 0) { 
			this.time = this.getNextEvtTime();
		}
	}
	
	/*
	 ******************************************************
	 Run a simulation scenario
	 ********************************************************
	 */
	public void runScenario() {
		// Simulation Loop
		while (this.time < this.endTime && !this.FEL.isEmpty()) {
//			SimulatorUI.logSimulationStep(this);
		    this.advanceSimulationTime();
		    // extract and process next events
		    List<eVENT> nextEvents = this.getFEL().removeNextEvents();
		    for (eVENT e : nextEvents) {
		      // apply event rule
	    	  List<eVENT> followUpEvents = e.onEvent();
		      // schedule follow-up events
		      for (eVENT f : followUpEvents) {
		        this.FEL.add(f);
		      }
		      // test if e is an exogenous event
		      if (e instanceof ExogenousEvent) {
		        // create and schedule next exogenous events
		        this.FEL.add(((ExogenousEvent)e).createNextEvent());
		      }
		    }
		  }
		 if(this.model.getComputeFinalStatisctics() != null) this.model.getComputeFinalStatisctics().accept(this);
	}
	
	/*
	 *******************************************************
	 Run a Standalone Simulation Scenario
	 *******************************************************
	 **/
	public void runStandaloneScenario() {
		  this.initializeSimulator();
		  this.initializeScenarioRun();
		  this.runScenario();
	}
	
	/*******************************************************
	 Run a Simple Experiment
	 * @return 
	 *******************************************************/
	public ExperimentsStatisticsDTO runSimpleExperiment(ExperimentType exp) {
		ExperimentsStatisticsDTO dto = new ExperimentsStatisticsDTO();
		Map <Number, Map<String, Number>> experimenStats = new HashMap<Number, Map<String, Number>>();
		
		this.initializeSimulator();
		 // initialize replication statistics record
		if(this.getModel().getSetupStatistics() != null) this.getModel().getSetupStatistics().accept(this);
		for (String varName : this.getStat().keySet()) {
			exp.getReplicStat().put(varName, new Number[exp.getNmrOfReplications()]); // an array per statistics variable
		}
		 // run experiment scenario replications
		for(int k = 0; k < exp.getNmrOfReplications(); k++) {
			this.initializeScenarioRun();
			this.runScenario();
			// store replication statistics
			for (Entry<String, Number[]> e : exp.getReplicStat().entrySet()) {
				Number[] value = e.getValue();
				value[k] = this.getStat().get(e.getKey());
				e.setValue(value);
			}
			System.out.println("<------ Experiment #" + k + " -------->");
			for (Entry<String, Number> es : this.getStat().entrySet()) {
				System.out.println(es.getKey() + " : " + es.getValue());
			}
			experimenStats.put(k, new HashMap<String, Number>(this.getStat()));
		}
		// define exp.summaryStat to be a map for the summary statistics
		HashMap<String, Map<String, Number>> sumStat = new HashMap <String, Map<String, Number>>();
		for (Entry<String, Number[]> var : exp.getReplicStat().entrySet()) {
			System.out.println("-----------------" + var.getKey() + "-----------------");
			Map <String, Number> mathStats = new HashMap<String, Number>();
			for (Entry<String, Function<Number[], Number>> stat : MathLib.summary.entrySet()) {
				Number calculatedStatValue = stat.getValue().apply(var.getValue());
				mathStats.put(stat.getKey(), calculatedStatValue);
				System.out.println(stat.getKey() + " : " + calculatedStatValue);
			}
			sumStat.put(var.getKey(), mathStats); // Exmpl: "queueLength" -> { {"Min":0}, {"Max":100}, {...} }
		}
		
		dto.setSumStat(sumStat);
		dto.setExperiments(experimenStats);
		return dto;
	}
	
	
}
