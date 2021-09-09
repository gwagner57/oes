package de.oes.core1.sim;

import java.util.ArrayList;


import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Map.Entry;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.apache.commons.math3.random.Well19937c;
import org.springframework.beans.factory.annotation.Autowired;


import de.oes.core1.dao.eXPERIMENTrUNDao;
import de.oes.core1.dao.eXPERIMENTsCENARIOrUNDao;
import de.oes.core1.endpoint.ui.ExperimentsStatisticsDTO;
import de.oes.core1.entity.eXPERIMENTrUN;
import de.oes.core1.entity.eXPERIMENTsCENARIOrUN;
import de.oes.core1.foundations.ExogenousEvent;
import de.oes.core1.foundations.eVENT;
import de.oes.core1.foundations.oBJECT;
import de.oes.core1.lib.EventList;
import de.oes.core1.lib.MathLib;
import de.oes.core1.lib.Rand;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Simulator {

	@Autowired
	private eXPERIMENTrUNDao eXPERIMENTrUNDao;
	
	@Autowired
	private eXPERIMENTsCENARIOrUNDao eXPERIMENTsCENARIOrUNDao;
	
	private eXPERIMENTrUN expRun;
	
	private Integer step = 0;
	private Double time = Double.valueOf(0);
	private Long endTime = 0l;
	private Integer idCounter = 1000;
	private Double nextMomentDeltaT;
	private Model model;
	private Double timeIncrement;
	private eXPERIMENTtYPE experimentType;
	private List<eXPERIMENTtYPE> experimentTypes = new ArrayList<eXPERIMENTtYPE>();
	private Scenario scenario = new Scenario();
	private List<Scenario> scenarios = new ArrayList<Scenario>();
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
		if(this.model.getNextMomentDeltaT() != null) {
			this.setNextMomentDeltaT(this.model.getNextMomentDeltaT());
		}
		if(this.model.getTime() == Time.DISCR) {
			this.nextMomentDeltaT = 1.0;
		} else {
			this.nextMomentDeltaT = oes.nextMomentDeltaT;
		}
		
		if(this.model.getTimeIncrement() != null) {
			this.setTimeIncrement(this.model.getTimeIncrement());
		} else {
			if (this.model.isOnEachTimeStep()) {
				this.setTimeIncrement(Double.valueOf(1));
			}
		}
		
		if(this.scenario.getScenarioNo() == null) {
			this.scenario.setScenarioNo(0l);
		}
		if(this.scenario.getTitle() == null) {
			this.scenario.setTitle("Default scenario");
		}
	}
	
	/*******************************************************************
	 * Assign model parameters with experiment parameter values ********
	 *******************************************************************/
	public void assignModelParameters(Map<String, Object> expParSlots) {
		Map<String, Object> p = this.model.getP();
		for (String key : p.keySet()) {
			p.put(key, expParSlots.get(key));
		}
	}
	
	/*
	 ******************************************************************
	 * Initialize a (standalone or experiment scenario) simulation run *
	 ******************************************************************
	 */
	public void initializeScenarioRun(Integer seed, Map<String, Object> expParSlots) {
		// clear initial state data structures
		this.objects.clear();
		this.FEL.clear();
		this.step = 0; // simulation loop step counter
		this.time = Double.valueOf(0); // simulation time
		// Set default values for end time parameters
		this.scenario.setDurationInSimTime(this.scenario.getDurationInSimTime() != null? this.scenario.getDurationInSimTime() : Long.MAX_VALUE);
		this.scenario.setDurationInCpuTime(this.scenario.getDurationInCpuTime() != null? this.scenario.getDurationInCpuTime() : Long.MAX_VALUE); 
		this.scenario.setDurationInSimSteps(this.scenario.getDurationInSimSteps() != null? this.scenario.getDurationInSimSteps() : Long.MAX_VALUE); 
		
		// get ID counter from simulation scenario, or set to default value
		this.idCounter = this.scenario.getIdCounter() != null? this.scenario.getIdCounter() : 1000;
		
		// set up a default random variate sampling method
		if(this.experimentType == null && this.scenario.getRandomSeed() != null) {
			Rand.setRng(new Well19937c(this.scenario.getRandomSeed()));
		} else if (seed != null) {
			Rand.setRng(new Well19937c(seed));
		} else {
			Rand.setRng(new Well19937c(MathLib.getUniformRandomInteger(0, 1000)));
		}
		
		// Assign model parameters with experiment parameter values
		if(!Objects.isNull(expParSlots)) this.assignModelParameters(expParSlots);
		// set up initial state
		if (this.scenario.getSetupInitialState() != null) this.scenario.getSetupInitialState().accept(this);
		if (this.model.getSetupStatistics() != null) this.model.getSetupStatistics().accept(this);
	}
	
	public void advanceSimulationTime() {
		this.nextEvtTime = this.getFEL().getNextOccurrenceTime(); // 0 if there is no next event
		// increment the step counter
		this.step++;
		
		 // advance simulation time
		if(this.timeIncrement != null) {
			if(this.nextEvtTime > this.time && this.nextEvtTime < this.time + this.timeIncrement) { 
				this.time = this.nextEvtTime;
			} else {
				this.time += this.timeIncrement; // valueOf ??
			}
		} else if (this.nextEvtTime > 0) {
			this.time = this.nextEvtTime;
		}
		
	}
	
	/*
	 ******************************************************
	 Run a simulation scenario
	 ********************************************************
	 */
	public void runScenario(boolean debug) {
		final long startTime = new Date().getTime();
		SimulatorUI.clearLogs();
		// Simulation Loop
		while (this.time < this.scenario.getDurationInSimTime() &&
				this.step < this.scenario.getDurationInSimSteps() &&
				new Date().getTime() - startTime < this.getScenario().getDurationInCpuTime()) {
			if(debug) SimulatorUI.logSimulationStep(this);
		    this.advanceSimulationTime();
		    // extract and process next events
		    List<eVENT> nextEvents = this.getFEL().removeNextEvents();
		    // sort simultaneous events according to priority order
		    if(nextEvents.size() > 1) nextEvents.sort(eVENT.rank());
		    // process next (=current) events
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
		        eVENT ne = ((ExogenousEvent) e).createNextEvent();
		        if(ne != null) this.FEL.add(ne);
		      }
		    }
		    if (this.timeIncrement == null && this.FEL.isEmpty()) {
		        break;
	      }
		}
		if(this.model.getComputeFinalStatisctics() != null) this.model.getComputeFinalStatisctics().accept(this);
	}
	
	/*
	 *******************************************************
	 Run a Standalone Simulation Scenario
	 *******************************************************
	 **/
	public void runStandaloneScenario(boolean debug) {
		  this.initializeSimulator();
		  if(this.scenario.getRandomSeed() == null) {
			  this.initializeScenarioRun(null, null);
		  } else {
			  this.initializeScenarioRun(this.scenario.getRandomSeed(), null);
		  }
		  this.runScenario(debug);
	}
	
	
	public ExperimentsStatisticsDTO runExperiment(boolean debug) {
		eXPERIMENTtYPE exp = this.getExperimentType();
		this.initializeSimulator();
		if (exp.isStoreExpResults()) {
			expRun = new eXPERIMENTrUN(
					eXPERIMENTrUN.getAutoId(), 
					exp, 
					this.scenario.getScenarioNo(), 
					new Date());
			eXPERIMENTrUNDao.merge(expRun);
		}
		if(exp.getParameterDefs() != null) return runParVarExperiment(exp, debug); 
		else return runSimpleExperiment(exp, debug);
	}
	
	/*******************************************************
	 Run a Simple Experiment
	 * @return 
	 *******************************************************/
	public ExperimentsStatisticsDTO runSimpleExperiment(eXPERIMENTtYPE exp, boolean debug) {
		ExperimentsStatisticsDTO dto = new ExperimentsStatisticsDTO();
		Map <Number, Map<String, Number>> experimenStats = new HashMap<Number, Map<String, Number>>();
		 // initialize replication statistics record
		if(this.getModel().getSetupStatistics() != null) this.getModel().getSetupStatistics().accept(this);
		for (String varName : this.stat.keySet()) {
			exp.getReplicStat().put(varName, new Number[exp.getNmrOfReplications()]); // an array per statistics variable
		}
		// run experiment scenario replications
		for(int k = 0; k < exp.getNmrOfReplications(); k++) {
			if(exp.getSeeds() != null) {
				this.initializeScenarioRun(exp.getSeeds()[k], null);
			} else {
				this.initializeScenarioRun(null, null);
			}
			this.runScenario(debug);
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
			if (exp.isStoreExpResults()) {
				 eXPERIMENTsCENARIOrUNDao.merge( new eXPERIMENTsCENARIOrUN(
						 expRun.getId() + k + 1,
						 expRun,
						 null, null,
						 this.stat));
		     }
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
	
	public ExperimentsStatisticsDTO runParVarExperiment(eXPERIMENTtYPE exp, boolean debug) {
		ExperimentsStatisticsDTO dto = new ExperimentsStatisticsDTO();
		final int N = exp.getParameterDefs().size();
		Map <Number, Map<String, Number>> experimenStats = new HashMap<Number, Map<String, Number>>();
		Map<String, Object> expParSlots = new HashMap<String, Object>();
		List<List<Object>> valueSets = new ArrayList<List<Object>>();
		// create a list of value sets, one set for each parameter
		for(int i = 0; i < N; i++) {
			eXPERIMENTpARAMdEF expPar = exp.getParameterDefs().get(i);
			if(expPar.getValues() == null) {
				// create value set
				expPar.setValues(new HashSet<Object>());
				int increm = expPar.getStepSize() == 0? 1 : expPar.getStepSize();
				for(int x = expPar.getStartValue(); x <= expPar.getEndValue(); x += increm) {
					expPar.getValues().add(x);
				}
			}
			valueSets.add(expPar.getValues().stream().collect(Collectors.toList()));
		}
		
		List<List<Object>> cp = MathLib.cartesianProduct(valueSets);
		final int M = cp.size(); // size of cartesian product
		System.out.println(valueSets);
		System.out.println(cp);
		System.out.println(M);
		 // set up statistics variables
		this.model.getSetupStatistics().accept(this);
		 // loop over all combinations of experiment parameter values
		List<List<Object>> parValues = new ArrayList<List<Object>>();
		for(int i = 0; i < M; i++) {
			List<Object> valueCombination = cp.get(i).stream().map(obj -> {
				return obj;
			}).collect(Collectors.toList());
			 // initialize the scenario record
			exp.getScenarios().add(i, new Scenario());
			exp.getScenarios().get(i).setParameterValues(valueCombination);
			// initialize experiment scenario statistics
			for(String varName : this.stat.keySet()) {
				exp.getScenarios().get(i).getStat().put(varName, 0);
			}
			 // create experiment parameter slots for assigning corresponding model variables
			for(int j = 0; j < N; j++) {
				expParSlots.put(exp.getParameterDefs().get(j).getName(), valueCombination.get(j));
			}
			
			if (exp.isStoreExpResults()) {
				 eXPERIMENTsCENARIOrUNDao.create( new eXPERIMENTsCENARIOrUN(
						 expRun.getId() + i + 1,
						 expRun,
						 Long.valueOf(i), 
						 exp.getScenarios().get(i).getParameterValues(), 
						 null));
		     }
			
			 // run experiment scenario replications
			for(int k = 0; k < exp.getNmrOfReplications(); k++) {
				if(exp.getSeeds() != null && exp.getSeeds().length > 0) {
					this.initializeScenarioRun(exp.getSeeds()[k], expParSlots);
				} else {
					this.initializeScenarioRun(null, expParSlots);
				}
				this.runScenario(debug);
				
				// add up replication statistics from sim.stat to sim.experimentType.scenarios[i].stat
				for(String varName : this.stat.keySet()) {
					Number n = exp.getScenarios().get(i).getStat().get(varName);
					n = this.stat.get(varName).doubleValue() + n.doubleValue();
					exp.getScenarios().get(i).getStat().replace(varName, n);
				}
				
				if (exp.isStoreExpResults()) {
					 eXPERIMENTsCENARIOrUNDao.create( new eXPERIMENTsCENARIOrUN(
							 expRun.getId() + M + i * exp.getNmrOfReplications() + k + 1,
							 expRun,
							 Long.valueOf(i), null, 
							 this.stat));
			     }
			}
			
			 // compute averages
			for(String varName : this.stat.keySet()) {
				Number n = exp.getScenarios().get(i).getStat().get(varName);
				n = n.doubleValue() / exp.getNmrOfReplications();
				exp.getScenarios().get(i).getStat().replace(varName, MathLib.round(n.doubleValue()));
			}
			
			
			System.out.println("expScenNo:" + i);
			System.out.println("expScenParamValues:" + exp.getScenarios().get(i).getParameterValues());
			System.out.println("stat:" + exp.getScenarios().get(i).getStat());
			parValues.add(exp.getScenarios().get(i).getParameterValues());
			
			experimenStats.put(i, new HashMap<String, Number>(this.getStat()));
		}
		
		if (exp.getSeeds() != null && exp.getSeeds().length < exp.getNmrOfReplications()) {
		    System.err.println("Not enough seeds defined for" + exp.getNmrOfReplications() + "replications");
		    return null;
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
		dto.setParamVal(parValues);
		return dto;
	}
	
	static class oes {
		protected final static Double nextMomentDeltaT = 0.01;
		protected final static int expostStatDecimalPlaces = 2;
		protected final static int simLogDecimalPlaces = 2;
	}
}
