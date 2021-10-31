package de.oes.core2.sim;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.Map.Entry;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.math3.random.Well19937c;
import org.springframework.beans.factory.annotation.Autowired;
import de.oes.core2.activities.aCTIVITY;
import de.oes.core2.activities.rESOURCE;
import de.oes.core2.activities.rESOURCEpOOL;
import de.oes.core2.activities.rESOURCErOLE;
import de.oes.core2.activities.tASKqUEUE;
import de.oes.core2.dao.eXPERIMENTrUNDao;
import de.oes.core2.dao.eXPERIMENTsCENARIOrUNDao;
import de.oes.core2.dto.ExperimentsStatisticsDTO;
import de.oes.core2.entity.eXPERIMENTrUN;
import de.oes.core2.entity.eXPERIMENTsCENARIOrUN;
import de.oes.core2.foundations.ExogenousEvent;
import de.oes.core2.foundations.eVENT;
import de.oes.core2.foundations.oBJECT;
import de.oes.core2.lib.EventList;
import de.oes.core2.lib.MathLib;
import de.oes.core2.lib.Rand;
import de.oes.core2.lib.SimulatorLogs;
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
	private Map<String, rESOURCEpOOL> resourcepools;
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
	private Map<Integer, eVENT> ongoingActivities;
	private SimulationStat stat = new SimulationStat();
	private Double nextEvtTime = Double.valueOf(0);
	private Map<String, Class<?>> classes = new HashMap<String, Class<?>>();
	private Map<String, aCTIVITY> aClasses = new HashMap<String, aCTIVITY>(); // to access static fields using class instances
	
	public void incrementStat(String name, Number inc) {
		Number num = this.stat.getSimpleStat().get(name);
		this.stat.getSimpleStat().replace(name, num, num.doubleValue() + inc.doubleValue());
	}
	
	public void updateStatValue(String name, Number newNumber) {
		Number num = this.stat.getSimpleStat().get(name);
		this.stat.getSimpleStat().replace(name, num, newNumber);
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
		else {
				if(this.model.getTime() == Time.DISCR) {
				this.nextMomentDeltaT = 1.0; 
			} else {
				this.nextMomentDeltaT = oes.nextMomentDeltaT;
			}
		}
		// Set timeIncrement for fixed-increment time progression
		if(this.model.getTimeIncrement() != null) {
			this.setTimeIncrement(this.model.getTimeIncrement());
		} else {
			if (this.model.isOnEachTimeStep()) {
				this.setTimeIncrement(Double.valueOf(1)); // default
			}
		}
		
		// Make sure these lists are defined
		if(this.model.getObjectTypes() == null) this.model.setObjectTypes(new ArrayList<Class<? extends oBJECT>>());
		if(this.model.getEventTypes() == null) this.model.setEventTypes(new ArrayList<Class<? extends eVENT>>());
		
		// a Map of all objects (accessible by ID)
		this.objects = new HashMap<Integer,oBJECT>();
		// The Future Events List
		this.setFEL(new EventList());
		// a map for statistics variables
		if(this.getStat() == null) this.setStat(new SimulationStat());
		// a className->Class map
		this.classes = new HashMap<String, Class<?>>();
		// Make object classes accessible via their object type name
		for (Class<? extends oBJECT> objType : this.model.getObjectTypes()) {
			String objTypeName = objType.getName();
			this.classes.put(objTypeName, objType);
		}
		// Make event classes accessible via their event type name
		for (Class<? extends eVENT> evtType : this.model.getEventTypes()) {
			String evtTypeName = evtType.getName();
			this.classes.put(evtTypeName, evtType);
		}
		// Assign scenarioNo = 0 to default scenario
		if(this.scenario.getScenarioNo() == null) this.scenario.setScenarioNo(0l);
		if(this.scenario.getTitle() == null) this.scenario.setTitle("Default scenario");
		/*** Activity extensions **********************************************/
		if(this.model.getActivityTypes() == null) this.model.setActivityTypes(new HashSet<String>());
		// Make activity classes accessible via their activity type name
		for (String actTypeName : this.model.getActivityTypes()) {
			this.classes.put(actTypeName, aClasses.get(actTypeName).getClass());
		}
		
		this.setupActivityStatistics();
		// a map for resource pools if there are no explicit process owners
		this.setResourcepools(new HashMap<String, rESOURCEpOOL>());
		// Initializations per activity type
		for (String actTypeName : this.model.getActivityTypes()) {
			aCTIVITY AT = this.aClasses.get(actTypeName);
			
			if(AT.getResourceRoles() == null) AT.setResourceRoles(new HashMap<String, rESOURCErOLE>());
			
			// Create the tasks queues
			AT.setTasks(new tASKqUEUE(null, this));
			// Create the resource pools
			for (String resRoleName : AT.getResourceRoles().keySet()) {
				rESOURCErOLE resRole = AT.getResourceRoles().get(resRoleName);			
				String pn = "";
				// set default cardinality
				if(resRole.getCard() == null && resRole.getMinCard() == null) resRole.setCard(1);
				rESOURCEpOOL altResTypes = null;
				if(resRole.getRange() != null) {
					String rn = resRole.getRange().getName();
					pn = Character.toLowerCase(rn.charAt(0)) + rn.substring(1) + "s";
					// create only if not yet created
					if(this.resourcepools.get(pn) == null) this.resourcepools.put(pn, new rESOURCEpOOL(this, null, resRole.getRange(), null, null));
					// assign resource pool to resource type
					resRole.getRange().setResourcePool(this.getResourcepools().get(pn));
					altResTypes = this.getResourcepools().get(pn).getResourceType().getAlternativeResourceTypes();				
				} else { // the resource role is associated with a count pool
					if(resRole.getCountPoolName() != null) {
						// a count pool has been explicitly assigned to the resource role
						pn = resRole.getCountPoolName();
					} else {
						// create default name for implicit count pool
						pn = resRoleName + (resRole.getCard() == null || resRole.getCard()==1? "s": "");
						// assign count pool to the resource role
						resRole.setCountPoolName(pn);				
					}
				}
				// create count pool only if not yet created
				if(this.resourcepools.get(pn) == null) this.resourcepools.put(pn, new rESOURCEpOOL(this, pn, null, 0, null));
				// assign the (newly created) pool to the resource role
				resRole.setResPool(this.getResourcepools().get(pn));
				// Subscribe activity types to resource pools
				resRole.getResPool().getDependentActivityTypes().add(AT);
				if(altResTypes != null) {
						//TODO
						//resRole.getResPool().getDependentActivityTypes().add(arT);
				}
			}
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
		// reset model-specific statistics
		if (this.model.getSetupStatistics() != null) this.model.getSetupStatistics().accept(this);
		/***START Activity extensions BEFORE-setupInitialState ********************/
		// Initialize resource pools
		for (String poolName : this.resourcepools.keySet()) {
			this.resourcepools.get(poolName).clear();
		}
		
		// set up initial state
		if (this.scenario.getSetupInitialState() != null) this.scenario.getSetupInitialState().accept(this);
		/***START Activity extensions AFTER-setupInitialState ****
		  ****************/
		this.initializeActivityStatistics();
		for (String actTypeName : this.model.getActivityTypes()) {
			// Reset/clear the tasks queues
			aCTIVITY AT = this.aClasses.get(actTypeName);
			AT.getTasks().clear();
		}
		// Initialize resource pools
		for (String poolName : this.resourcepools.keySet()) {
			Integer nmrOfAvailRes = this.resourcepools.get(poolName).getAvailable();
			if(nmrOfAvailRes != null) { // a count pool
				// the size of a count pool is the number of initially available resources
				this.resourcepools.get(poolName).setSize(nmrOfAvailRes);
			}
		}
		/***END Activity extensions AFTER-setupInitialState *********************/
	}
	
	
	/*******************************************************
	 Advance Simulation Time
	 ********************************************************/
	public void advanceSimulationTime() {
		this.nextEvtTime = this.getFEL().getNextOccurrenceTime(); // 0 if there is no next event
		// increment the step counter
		this.step++;
		
		 // advance simulation time
		if(this.timeIncrement != null) { // fixed-increment time progression
			// fixed-increment time progression simulations may also have events
			if(this.nextEvtTime > this.time && this.nextEvtTime < this.time + this.timeIncrement) { 
				this.time = this.nextEvtTime;
			} else {
				this.time += this.timeIncrement;
			}
		} else if (this.nextEvtTime > 0) { // next-event time progression
			this.time = this.nextEvtTime;
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
	 ******************************************************
	 Run a simulation scenario
	 ********************************************************
	 */
	public void runScenario(boolean debug) {
		final long startTime = new Date().getTime();
		SimulatorLogs.clearLogs();
		// Simulation Loop
		while (this.time < this.scenario.getDurationInSimTime() &&
				this.step < this.scenario.getDurationInSimSteps() &&
				new Date().getTime() - startTime < this.getScenario().getDurationInCpuTime()) {
			if(debug) SimulatorLogs.logSimulationStep(this);
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
		      
		      /**** ACTIVITIES extension START ****/
		      // if event class with successorActivity
		      if(e.getSuccessorActivity() != null) {
		    	  aCTIVITY SuccActivityClass = this.aClasses.get(e.getSuccessorActivity());
		          // enqueue successor activity
		    	  SuccActivityClass.getTasks().startOrEnqueue(SuccActivityClass.newInstance());
		      }
		      /**** ACTIVITIES extension END ****/
		      
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
	
	/*******************************************************
	 Run an Experiment 
	 ********************************************************/
	public ExperimentsStatisticsDTO runExperiment(boolean debug) {
		// set up user-defined statistics variables
		if(this.model.getSetupStatistics() != null) this.model.getSetupStatistics().accept(this);
		
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
		// initialize replication statistics
		exp.setReplicStat(new ReplicationStat());
		for (String varName : this.stat.getSimpleStat().keySet()) {
			exp.getReplicStat().getSimpleStat().put(varName, new Number[exp.getNmrOfReplications()]); // an array per statistics variable
		}
		 /***START Activity extensions BEFORE-runSimpleExperiment ********************/
		exp.getReplicStat().setActTypes(new HashMap<String,ReplicationActivityStat>());
	    for (String actTypeName : this.stat.getActTypes().keySet()) {
	    	ReplicationActivityStat replStat = new ReplicationActivityStat();
	    	Integer k = exp.getNmrOfReplications();
	    	if(this.stat.getActTypes().get(actTypeName).getWaitingTime() != null) {
	    		replStat.setWaitingTimeouts(new Integer[k]);
	    	}
	    	
			replStat.setEnqueuedActivities(new Integer[k]);
	    	replStat.setStartedActivities(new Integer[k]);
	    	replStat.setCompletedActivities(new Integer[k]);
	    	replStat.setQueueLength(new GenericStat[k]);
	    	replStat.setWaitingTime(new GenericStat[k]);
	    	replStat.setCycleTime(new GenericStat[k]);
	        exp.getReplicStat().getActTypes().put(actTypeName, replStat);
	    }
		   /***END Activity extensions BEFORE-runSimpleExperiment ********************/
		
		// run experiment scenario replications
		for(int k = 0; k < exp.getNmrOfReplications(); k++) {
			if(exp.getSeeds() != null) {
				this.initializeScenarioRun(exp.getSeeds()[k], null);
			} else {
				this.initializeScenarioRun(null, null);
			}
			this.runScenario(debug);
			// store replication statistics
			for (Entry<String, Number[]> e : exp.getReplicStat().getSimpleStat().entrySet()) {
				Number[] value = e.getValue();
				value[k] = this.getStat().getSimpleStat().get(e.getKey());
				e.setValue(value);
			}
			/***START Activity extensions AFTER-runSimpleExperimentScenario ********************/
			for (String actTypeName : exp.getReplicStat().getActTypes().keySet()) {
				ReplicationActivityStat replActStat = exp.getReplicStat().getActTypes().get(actTypeName);
				ActivityStat actStat = this.stat.getActTypes().get(actTypeName);
				replActStat.getEnqueuedActivities()[k] = actStat.getEnqueuedActivities();
				if(this.stat.getActTypes().get(actTypeName).getWaitingTime() != null) {
					replActStat.getWaitingTimeouts()[k] = actStat.getWaitingTimeouts();
		    	}
				replActStat.getStartedActivities()[k] = actStat.getStartedActivities();
				replActStat.getCompletedActivities()[k] = actStat.getCompletedActivities();
				replActStat.getQueueLength()[k] = actStat.getQueueLength();
				replActStat.getWaitingTime()[k] = actStat.getWaitingTime();
				replActStat.getCycleTime()[k] = actStat.getCycleTime();
				
			}
		    /***END Activity extensions AFTER-runSimpleExperimentScenario ********************/
			
			
			System.out.println("<------ Experiment #" + k + " -------->");
			for (Entry<String, Number> es : this.getStat().getSimpleStat().entrySet()) {
				System.out.println(es.getKey() + " : " + es.getValue());
			}
			experimenStats.put(k, new HashMap<String, Number>(this.getStat().getSimpleStat()));
			if (exp.isStoreExpResults()) {
				 eXPERIMENTsCENARIOrUNDao.merge( new eXPERIMENTsCENARIOrUN(
						 expRun.getId() + k + 1,
						 expRun,
						 null, null,
						 this.stat.getSimpleStat()));
		     }
		}
	    
		// define exp.summaryStat to be a map for the summary statistics
		HashMap<String, Map<String, Number>> sumStat = new HashMap <String, Map<String, Number>>();
		for (Entry<String, Number[]> var : exp.getReplicStat().getSimpleStat().entrySet()) {
			System.out.println("-----------------" + var.getKey() + "-----------------");
			Map <String, Number> mathStats = new HashMap<String, Number>();
			for (Entry<String, Function<Number[], Number>> stat : MathLib.summary.entrySet()) {
				Number calculatedStatValue = stat.getValue().apply(var.getValue());
				mathStats.put(stat.getKey(), calculatedStatValue);
				System.out.println(stat.getKey() + " : " + calculatedStatValue);
			}
			
			sumStat.put(var.getKey(), mathStats); // Exmpl: "queueLength" -> { {"Min":0}, {"Max":100}, {...} }
		}
		
		
		TreeMap<String, Map<String, Map<String, Number>>> actStat = new TreeMap<String, Map <String, Map<String, Number>>>();
		for (Entry<String, ReplicationActivityStat> var : exp.getReplicStat().getActTypes().entrySet()) {
			System.out.println("-----------------" + var.getKey() + "-----------------");
			HashMap<String, Map<String, Number>> actPerTypeStat = new HashMap <String, Map<String, Number>>();
			for (int i = 0; i < exp.getNmrOfReplications(); i++) {
				HashMap<String, Number> actStatVal = new HashMap<String, Number>();
				actStatVal.put("enqu", MathLib.round(var.getValue().getEnqueuedActivities()[i].doubleValue()));
				actStatVal.put("start", MathLib.round(var.getValue().getStartedActivities()[i].doubleValue()));
				actStatVal.put("compl", MathLib.round(var.getValue().getCompletedActivities()[i].doubleValue()));
				actStatVal.put("wTime", MathLib.round(var.getValue().getWaitingTimeouts()[i].doubleValue()));
				actStatVal.put("qLen", MathLib.round(var.getValue().getQueueLength()[i].getMax().doubleValue()));
				actStatVal.put("cTime", MathLib.round(var.getValue().getCycleTime()[i].getMax().doubleValue()));
				actPerTypeStat.put(String.valueOf(i), actStatVal);
			}
			for (Entry<String, Function<Number[], Number>> stat : MathLib.summary.entrySet()) {
				Number ca = stat.getValue().apply(var.getValue().getCompletedActivities());
				Number ea = stat.getValue().apply(var.getValue().getEnqueuedActivities());
				Number sa = stat.getValue().apply(var.getValue().getStartedActivities());
				Number wt = stat.getValue().apply(var.getValue().getWaitingTimeouts());
				
				List<Number> ql = Stream.of(var.getValue().getQueueLength()).map(GenericStat::getMax).collect(Collectors.toList());
				Number[] qlArr = ql.toArray(new Number[0]);
				Number qlStat = stat.getValue().apply(qlArr);
				
				List<Number> ct = Stream.of(var.getValue().getCycleTime()).map(GenericStat::getMax).collect(Collectors.toList());
				Number[] ctArr = ct.toArray(new Number[0]);
				Number ctStat = stat.getValue().apply(ctArr);
				
				
				List<Number> wtt = Stream.of(var.getValue().getWaitingTime()).map(GenericStat::getMax).collect(Collectors.toList());
				Number[] wttArr = wtt.toArray(new Number[0]);
				Number wttStat = stat.getValue().apply(wttArr);
				
				HashMap<String, Number> actStatVal = new HashMap<String, Number>();
				actStatVal.put("enqu", MathLib.round(ea.doubleValue()));
				actStatVal.put("start", MathLib.round(sa.doubleValue()));
				actStatVal.put("compl", MathLib.round(ca.doubleValue()));
				actStatVal.put("wTime", MathLib.round(wt.doubleValue()));
				actStatVal.put("qLen", MathLib.round(qlStat.doubleValue()));
				actStatVal.put("cTime", MathLib.round(ctStat.doubleValue()));
				actPerTypeStat.put(stat.getKey(), actStatVal);
				
				System.out.println(stat.getKey() + " queueLength : " + qlStat);
				System.out.println(stat.getKey() + " cycleTime : " + ctStat);
				System.out.println(stat.getKey() + " completedActivities : " + ca);
				System.out.println(stat.getKey() + " enqueuedActivities : " + ea);
				System.out.println(stat.getKey() + " startedActivities : " + sa);
				System.out.println(stat.getKey() + " waitingTimeouts : " + wt);
			}
			
			actStat.put(var.getKey(), actPerTypeStat);
		}
		
		dto.setActStat(actStat);
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
			for(String varName : this.stat.getSimpleStat().keySet()) {
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
				for(String varName : this.stat.getSimpleStat().keySet()) {
					Number n = exp.getScenarios().get(i).getStat().get(varName);
					n = this.stat.getSimpleStat().get(varName).doubleValue() + n.doubleValue();
					exp.getScenarios().get(i).getStat().replace(varName, n);
				}
				
				if (exp.isStoreExpResults()) {
					 eXPERIMENTsCENARIOrUNDao.create( new eXPERIMENTsCENARIOrUN(
							 expRun.getId() + M + i * exp.getNmrOfReplications() + k + 1,
							 expRun,
							 Long.valueOf(i), null, 
							 this.stat.getSimpleStat()));
			     }
			}
			
			 // compute averages
			for(String varName : this.stat.getSimpleStat().keySet()) {
				Number n = exp.getScenarios().get(i).getStat().get(varName);
				n = n.doubleValue() / exp.getNmrOfReplications();
				exp.getScenarios().get(i).getStat().replace(varName, MathLib.round(n.doubleValue()));
			}
			
			
			System.out.println("expScenNo:" + i);
			System.out.println("expScenParamValues:" + exp.getScenarios().get(i).getParameterValues());
			System.out.println("stat:" + exp.getScenarios().get(i).getStat());
			parValues.add(exp.getScenarios().get(i).getParameterValues());
			
			experimenStats.put(i, new HashMap<String, Number>(this.getStat().getSimpleStat()));
		}
		
		if (exp.getSeeds() != null && exp.getSeeds().length < exp.getNmrOfReplications()) {
		    System.err.println("Not enough seeds defined for" + exp.getNmrOfReplications() + "replications");
		    return null;
		}
		
		// define exp.summaryStat to be a map for the summary statistics
		HashMap<String, Map<String, Number>> sumStat = new HashMap <String, Map<String, Number>>();
		for (Entry<String, Number[]> var : exp.getReplicStat().getSimpleStat().entrySet()) {
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
	
	
	/*******************************************************
	 * Set up the generic activity ex-post statistics
	 ********************************************************/
	public void setupActivityStatistics() {
		if(this.model.getActivityTypes() != null && this.model.getActivityTypes().size() > 0) {
			for (String actTypeName : this.model.getActivityTypes()) {
				ActivityStat actStat = new ActivityStat();
				actStat.setQueueLength(GenericStat.builder().value(0).build());
				actStat.setWaitingTime(GenericStat.builder().value(0).build());
				actStat.setCycleTime(GenericStat.builder().value(0).build());
				actStat.setResUtil(new HashMap<String, Number>());
				this.stat.getActTypes().put(actTypeName, actStat);
			}
		}
	}
	
	/*******************************************************
	 * Initialize the pre-defined ex-post statistics
	 ********************************************************/
	public void initializeActivityStatistics() {
		if(this.model.getActivityTypes() != null && this.model.getActivityTypes().size() > 0) {
			this.stat.setIncludeTimeouts(this.getAClasses().values().stream().anyMatch(a -> a.getWaitingTimeoutFunc() != null));
			for (String actTypeName : this.model.getActivityTypes()) {
				ActivityStat actStat = this.stat.getActTypes().get(actTypeName);
				aCTIVITY AT = this.aClasses.get(actTypeName);
				Map<String, Number> resUtilPerAT = actStat.getResUtil();
				actStat.setEnqueuedActivities(0);
				actStat.setStartedActivities(0);
				actStat.setCompletedActivities(0);
				actStat.setQueueLength(GenericStat.builder().max(0).build());
				actStat.setWaitingTime(GenericStat.builder().max(0).build());
				actStat.setWaitingTimeouts(0);
				actStat.setCycleTime(GenericStat.builder().max(0).build());
				for (String resRoleName : AT.getResourceRoles().keySet()) {
					rESOURCErOLE resRole = AT.getResourceRoles().get(resRoleName);
					if(resRole.getRange() != null) {
						for (rESOURCE resObj : resRole.getResPool().getAvailResources()) {
							resUtilPerAT.put(resObj.getId().toString(), 0);
						}
					} else {
						resUtilPerAT.put(resRole.getCountPoolName(), 0);
					}
				}
			}
		}
	}
	
	static class oes {
		protected final static Double nextMomentDeltaT = 0.01;
		protected final static int expostStatDecimalPlaces = 2;
		protected final static int simLogDecimalPlaces = 2;
		
	}

	public void scheduleEvent(eVENT event) {
		this.FEL.add(event);
	}
	
	public void checkProcNetConstraints(Object... params) {
		//TODO
//		 var errMsgs=[], msg="", evts=[];
//		  // PNC1: nmrOfArrObjects = nmrOfObjectsAtProcNodes + nmrOfObjectsAtExitNodes + nmrOfDepObjects
//		  var nmrOfArrObjects = Object.keys( oes.EntryNode.instances).reduce( function (res, nodeObjIdStr) {
//		    return res + sim.objects[nodeObjIdStr].nmrOfArrivedObjects
//		  }, 0);
//		  var nmrOfObjectsAtProcNodes = Object.keys( oes.ProcessingNode.instances).reduce( function (res, nodeObjIdStr) {
//		    return res + sim.objects[nodeObjIdStr].inputBuffer.length
//		  }, 0);
//		  var nmrOfObjectsAtExitNodes = Object.keys( oes.ExitNode.instances).reduce( function (res, nodeObjIdStr) {
//		    return res + sim.objects[nodeObjIdStr].inputBuffer.length
//		  }, 0);
//		  var nmrOfDepObjects = Object.keys( oes.ExitNode.instances).reduce( function (res, nodeObjIdStr) {
//		    return res + sim.objects[nodeObjIdStr].nmrOfDepartedObjects
//		  }, 0);
//		  if (nmrOfArrObjects !== nmrOfObjectsAtProcNodes + nmrOfObjectsAtExitNodes + nmrOfDepObjects) {
//		    msg = "The object preservation constraint is violated at step "+ sim.step +
//		        (params && params.add ? params.add : "") +
//		        " (nmrOfArrObjects: "+ nmrOfArrObjects +
//		        ", nmrOfObjectsInSystem: "+ String(nmrOfObjectsAtProcNodes+nmrOfObjectsAtExitNodes) +
//		        ", nmrOfDepObjects: "+ nmrOfDepObjects +")";
//		    if (params && params.log) console.log( msg);
//		    else errMsgs.push( msg);
//		  }
//		  // PNC2: if a proc. node has a proc. end event, its input queue must be non-empty
//		  evts = sim.FEL.getEventsOfType("pROCESSINGaCTIVITYeND");
//		  evts.forEach( function (procEndEvt) {
//		    var pN = procEndEvt.processingNode, inpQ = pN.inputBuffer;
//		    if (inpQ.length === 0 || !inpQ[0]) {
//		      msg = "At step "+ sim.step +" "+ (params && params.add ? params.add : "") +
//		          ", the proc. node "+ (pN.name||pN.id) +" has an empty input queue.";
//		      if (params && params.log) console.log( msg);
//		      else errMsgs.push( msg);
//		    }
//		  });
//		  return errMsgs;
	}
}
