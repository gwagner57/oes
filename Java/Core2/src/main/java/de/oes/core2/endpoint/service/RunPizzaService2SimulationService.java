package de.oes.core2.endpoint.service;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.Map.Entry;
import java.util.function.Consumer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.stereotype.Component;

import de.oes.core2.activities.rANGE;
import de.oes.core2.activities.rESOURCEpOOL;
import de.oes.core2.activities.rESOURCEsTATUS;
import de.oes.core2.dto.ExperimentsStatisticsDTO;
import de.oes.core2.dto.SimulationSettingsDTO;
import de.oes.core2.lib.MathLib;
import de.oes.core2.lib.SimulatorLogs;
import de.oes.core2.pizzaservice2.MakePizza;
import de.oes.core2.pizzaservice2.Order;
import de.oes.core2.pizzaservice2.PizzaService;
import de.oes.core2.sim.ActivityStat;
import de.oes.core2.sim.Model;
import de.oes.core2.sim.Scenario;
import de.oes.core2.sim.Simulator;
import de.oes.core2.sim.Time;
import de.oes.core2.sim.TimeUnit;
import de.oes.core2.sim.eXPERIMENTtYPE;

@Component
public class RunPizzaService2SimulationService {

		@Autowired
		private  AutowireCapableBeanFactory autowireCapableBeanFactory;
		
		public void run(SimulationSettingsDTO dto, org.springframework.ui.Model m) {
			Model model = initializeModel();
			Simulator sim = new Simulator();
			Scenario scenario = new Scenario();
			
			scenario = initScenario(sim);
			
			setStatisticVariables(model, sim);
			
			initSimulation(model, sim, scenario);
			
			if(dto.getType() == 0) { // (0) Standalone scenario
				runStandaloneScenario(sim, dto.isSimulationLog());
				m.addAttribute("stat", sim.getStat().getSimpleStat());
				
				calculateResUtil(sim.getStat().getActTypes().values(), sim);
				m.addAttribute("actStat", sim.getStat().getActTypes());
				if(dto.isSimulationLog()) m.addAttribute("logs", SimulatorLogs.getLogs());
			} else { // (1) Simple Experiment with 10 replications, each running for 1000 min.
				eXPERIMENTtYPE expType = defineExperimentType(model, scenario);
				ExperimentsStatisticsDTO resutlDTO = runExperiment(sim, expType, dto.isSimulationLog());
				m.addAttribute("stat", resutlDTO);
			}
		}
		
		
		private void calculateResUtil(Collection<ActivityStat> activityStats, Simulator sim) {
			for (ActivityStat activityStat : activityStats) {
				activityStat.getResUtil().replaceAll((k,v) -> MathLib.round(v.doubleValue() / sim.getTime()));
			}
		}
		
		private ExperimentsStatisticsDTO runExperiment(Simulator sim, eXPERIMENTtYPE expType, boolean logs) {
			autowireCapableBeanFactory.autowireBean(sim);
			sim.setExperimentType(expType);
			return sim.runExperiment(logs);
		}



		private void runStandaloneScenario(Simulator sim, boolean logs) {
			sim.runStandaloneScenario(logs);
			System.out.println("FINAL STAT");
			for (Entry<String, Number> e : sim.getStat().getSimpleStat().entrySet()) {
				System.out.println(e.getKey() + " : " + e.getValue());
			}
			
			for (ActivityStat a : sim.getStat().getActTypes().values()) {
				System.out.println(a.getResUtil());
			}
		}



		private void initSimulation(Model model, Simulator sim, Scenario scenario) {
			sim.setModel(model);
			sim.setScenario(scenario);
		}



		/*******************************************************
		 Define an experiment (type)
		********************************************************/
		private eXPERIMENTtYPE defineExperimentType(Model model, Scenario scenario) {
			eXPERIMENTtYPE expType = new eXPERIMENTtYPE(
				model,
				"Simple Experiment with 10 replications, each running for "  + scenario.getDurationInSimTime() + " " + model.getTimeUnit(),
				10, // nmrOfReplications
				null, // parameterDef
				new Integer[] {123, 234, 345, 456, 567, 678, 789, 890, 901, 1012} // seeds
				);
			expType.setStoreExpResults(true);
			return expType;
		}


		/*******************************************************
		 Statistics variables
		********************************************************/
		private void setStatisticVariables(Model model, Simulator sim) {
			Consumer<Simulator> setupStatistics = s -> {
				 s.getStat().getSimpleStat().put("nmrOfOrders", Integer.valueOf(0));
			};
			model.setSetupStatistics(setupStatistics);
		}

		/*******************************************************
		 Simulation Scenario
		 ********************************************************/
		private Scenario initScenario(Simulator sim) {
			MakePizza mp = new MakePizza(sim,0,0,0,null);
			sim.getAClasses().put("MakePizza", new MakePizza(sim,0,0,0,null));
			Scenario scenario = new Scenario();
			scenario.setDurationInSimTime(300l);
			// Initial State
			Consumer<Simulator> setupInitialState = s -> {
				 // Create initial objects
				PizzaService ps = new PizzaService(1, "ps", sim, rESOURCEsTATUS.AVAILABLE);
				// Initialize the resource pool
			
				rANGE range = new rANGE();
				rESOURCEpOOL rp = new rESOURCEpOOL(s, "pizzaServices", range, 1, List.of(ps));
				s.getResourcepools().put("pizzaServices", rp);
				// Schedule initial events
				s.getFEL().add(new Order(s, 1l, null, ps));
				
				ps.setResourcePool(rp);
				mp.getResourceRoles().get("pizzaService").setResPool(rp);
			};
			scenario.setSetupInitialState(setupInitialState);
			return scenario;
		}

		
		/*******************************************************
		 Simulation Model
		********************************************************/
		private Model initializeModel() {
			Model model = new Model();
			model.setName("Pizza-Server-2");
			model.setTime(Time.CONT);
			model.setTimeUnit(TimeUnit.min);
			
			model.setObjectTypes(List.of(PizzaService.class));
			model.setEventTypes(List.of(Order.class));
			model.setActivityTypes(Set.of("MakePizza"));
			return model;
		}
}
