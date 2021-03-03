package de.oes.core0.endpoint;

import java.util.ArrayList;

import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.function.Supplier;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import de.oes.core0.endpoint.ui.ExperimentsStatisticsDTO;
import de.oes.core0.foundations.oBJECT;
import de.oes.core0.inventorymanagment.DailyDemand;
import de.oes.core0.inventorymanagment.Delivery;
import de.oes.core0.inventorymanagment.SingleProductShop;
import de.oes.core0.lib.MathLib;
import de.oes.core0.servicedesk0.CustomerArrival;
import de.oes.core0.servicedesk0.CustomerDeparture;
import de.oes.core0.servicedesk1.Customer;
import de.oes.core0.servicedesk1.ServiceDesk;
import de.oes.core0.sim.ExperimentType;
import de.oes.core0.sim.Model;
import de.oes.core0.sim.Scenario;
import de.oes.core0.sim.Simulator;
import de.oes.core0.sim.Time;
import de.oes.core0.sim.TimeUnit;

@Controller
public class ObjectEventSimulationEndpoint {

	@RequestMapping("/")
	public String index() {
	    return "index";
	}
	
	@RequestMapping("/core0/servicedesk0")
	public String servicedesk0(org.springframework.ui.Model m) {
		Model model = new Model();
		model.setTime(Time.DISCR);
		model.setTimeUnit(TimeUnit.min);
		model.setObjectTypes(new ArrayList<Class<? extends oBJECT>>());
		model.setEventTypes(List.of(CustomerArrival.class, CustomerDeparture.class));
		Supplier<Integer> serviceTime = new Supplier<Integer>() {
			@Override
			public Integer get() {
				  Integer r = MathLib.getUniformRandomInteger( 0, 99);
				  if ( r < 30) return 2;         // probability 0.30
				  else if ( r < 80) return 3;    // probability 0.50
				  else return 4;                 // probability 0.20
			}
		};
		model.setF(Map.of("serviceTime", serviceTime));
		
		Consumer<Simulator> setupStatistics = s -> {
			 s.getStat().put("arrivedCustomers", Integer.valueOf(0));
			 s.getStat().put("departedCustomers", Integer.valueOf(0));
			 s.getStat().put("maxQueueLength", Integer.valueOf(0));
		};
		model.setSetupStatistics(setupStatistics);
		
		Scenario scenario = new Scenario();
		scenario.setDurationInSimTime(1000l);
		Consumer<Simulator> setupInitialState = s -> {
			s.getModel().getV().put("queueLength", Integer.valueOf(0));
			s.getFEL().add(new CustomerArrival(s, 1l, null));
		};
		scenario.setSetupInitialState(setupInitialState);
		
		Simulator sim = new Simulator();
		sim.setModel(model);
		sim.setScenario(scenario);
		sim.setExperimentType(new ExperimentType(1, "Simple Experiment with 10 replications, each running for "  + sim.getScenario().getDurationInSimTime() + " " + sim.getModel().getTimeUnit(), 10));
		
		ExperimentsStatisticsDTO expStat = sim.runSimpleExperiment(sim.getExperimentType());
		m.addAttribute("stat", expStat);
		m.addAttribute("expInfo", sim.getExperimentType().getTitle());
	    return "core0_servicedesk0";
	}
	
	@RequestMapping("/core0/servicedesk1")
	public String servicedesk1(org.springframework.ui.Model m) {
		//prepare
		Model model = new Model();
		model.setTime(Time.DISCR);
		model.setTimeUnit(TimeUnit.min);
		model.setObjectTypes(new ArrayList<Class<? extends oBJECT>>());
		model.setEventTypes(List.of(de.oes.core0.servicedesk1.CustomerArrival.class, de.oes.core0.servicedesk1.CustomerDeparture.class));
		Supplier<Integer> serviceTime = new Supplier<Integer>() {
			@Override
			public Integer get() {
				  Integer r = MathLib.getUniformRandomInteger( 0, 99);
				  if ( r < 30) return 2;         // probability 0.30
				  else if ( r < 80) return 3;    // probability 0.50
				  else return 4;                 // probability 0.20
			}
		};
		model.setF(Map.of("serviceTime", serviceTime));
		
		Consumer<Simulator> setupStatistics = s -> {
			 s.getStat().put("arrivedCustomers", Integer.valueOf(0));
			 s.getStat().put("departedCustomers", Integer.valueOf(0));
			 s.getStat().put("maxQueueLength", Integer.valueOf(0));
		};
		model.setSetupStatistics(setupStatistics);
		
		Simulator sim = new Simulator();
		ServiceDesk sd = new ServiceDesk(1, "serviceDesk", sim, 0l);
		
		Scenario scenario = new Scenario();
		scenario.setDurationInSimTime(1000l);
		Consumer<Simulator> setupInitialState = s -> {
			s.getModel().getV().put("queueLength", Integer.valueOf(0));
			s.getFEL().add(new de.oes.core0.servicedesk1.CustomerArrival(s, 1l, null, sd));
		};
		scenario.setSetupInitialState(setupInitialState);
		
		
		sim.setModel(model);
		sim.setScenario(scenario);
		sim.setExperimentType(new ExperimentType(1, "Simple Experiment with 10 replications, each running for "  + sim.getScenario().getDurationInSimTime() + " " + sim.getModel().getTimeUnit(), 10));
		//mocks

		//test
		sim.runStandaloneScenario();
		//check
		m.addAttribute("stat", sim.getStat());
		return "core0_servicedesk1";
	}
	
	@RequestMapping("/core0/servicedesk2")
	public String servicedesk2(org.springframework.ui.Model m) {
		//prepare
		Model model = new Model();
		model.setTime(Time.CONT);
		model.setTimeUnit(TimeUnit.min);
		model.setObjectTypes(List.of(de.oes.core0.servicedesk2.ServiceDesk.class, Customer.class));
		model.setEventTypes(List.of(de.oes.core0.servicedesk2.CustomerArrival.class, de.oes.core0.servicedesk2.CustomerDeparture.class));
		Supplier<Integer> serviceTime = new Supplier<Integer>() {
			@Override
			public Integer get() {
				  Integer r = MathLib.getUniformRandomInteger( 0, 99);
				  if ( r < 30) return 2;         // probability 0.30
				  else if ( r < 80) return 3;    // probability 0.50
				  else return 4;                 // probability 0.20
			}
		};
		model.setF(Map.of("serviceTime", serviceTime));
		
		Consumer<Simulator> setupStatistics = s -> {
			 s.getStat().put("arrivedCustomers", Integer.valueOf(0));
			 s.getStat().put("departedCustomers", Integer.valueOf(0));
			 s.getStat().put("cumulativeTimeInSystem", Double.valueOf(0));
			 s.getStat().put("meanTimeInSystem", Double.valueOf(0));
			 s.getStat().put("maxQueueLength", Integer.valueOf(0));
		};
		model.setSetupStatistics(setupStatistics);
		
		Simulator sim = new Simulator();
		
		Scenario scenario = new Scenario();
		scenario.setDurationInSimTime(1000l);
		Consumer<Simulator> setupInitialState = s -> {
			de.oes.core0.servicedesk2.ServiceDesk sd = new de.oes.core0.servicedesk2.ServiceDesk(1, "serviceDesk", sim);
			s.getModel().getV().put("queueLength", Integer.valueOf(0));
			s.getFEL().add(new de.oes.core0.servicedesk2.CustomerArrival(s, 1l, null, sd));
		};
		scenario.setSetupInitialState(setupInitialState);
		
		Consumer<Simulator> computeFinalStatistics = s -> {
			 s.getStat().put("meanTimeInSystem", MathLib.round(Double.valueOf(sim.getStat().get("cumulativeTimeInSystem").doubleValue() / sim.getStat().get("departedCustomers").doubleValue())));
		};
		model.setComputeFinalStatisctics(computeFinalStatistics);
		
		sim.setModel(model);
		sim.setScenario(scenario);
		sim.setExperimentType(new ExperimentType(1, "Simple Experiment with 10 replications, each running for "  + sim.getScenario().getDurationInSimTime() + " " + sim.getModel().getTimeUnit(), 10));
		//mocks

		//test
		ExperimentsStatisticsDTO expStat = sim.runSimpleExperiment(sim.getExperimentType());
		m.addAttribute("stat", expStat);
		m.addAttribute("expInfo", sim.getExperimentType().getTitle());
		return "core0_servicedesk2";
	}
	
	@RequestMapping("/core0/inventory-managment")
	public String inventoryManagment(org.springframework.ui.Model m) {
		Model model = new Model();
		model.setTime(Time.DISCR);
		model.setTimeUnit(TimeUnit.days);
		model.setObjectTypes(List.of(SingleProductShop.class));
		model.setEventTypes(List.of(DailyDemand.class, Delivery.class));
		Consumer<Simulator> setupStatistics = s -> {
			 s.getStat().put("nmrOfStockOuts", Integer.valueOf(0));
			 s.getStat().put("lostSales", Integer.valueOf(0));
			 s.getStat().put("serviceLevel", Double.valueOf(0));
		};
		model.setSetupStatistics(setupStatistics);
		Consumer<Simulator> computeFinalStatistics = s -> {
			 s.getStat().put("serviceLevel", Double.valueOf((s.getTime().doubleValue() - s.getStat().get("nmrOfStockOuts").doubleValue()) / s.getTime().doubleValue() * 100.0));
		};
		model.setComputeFinalStatisctics(computeFinalStatistics);
		
		Scenario scenario = new Scenario();
		scenario.setDurationInSimTime(1000l);
		Consumer<Simulator> setupInitialState = s -> {
			SingleProductShop tvShop = new SingleProductShop(1, "TV Shop", s, 80, 50, 100);
//			s.setObjects(Map.of("tvShop", tvShop)); TODO used for?
			s.getFEL().add(new DailyDemand(s, 1l, 25, tvShop));
		};
		scenario.setSetupInitialState(setupInitialState);
		
		Simulator sim = new Simulator();
		sim.setModel(model);
		sim.setScenario(scenario);
		sim.setExperimentType(new ExperimentType(1, "Simple Experiment with 10 replications, each running for "  + sim.getScenario().getDurationInSimTime() + " " + sim.getModel().getTimeUnit(), 10));
		
		
		ExperimentsStatisticsDTO expStat = sim.runSimpleExperiment(sim.getExperimentType());
		sim.getModel().getComputeFinalStatisctics().accept(sim);
		
		m.addAttribute("stat", expStat);
		m.addAttribute("expInfo", sim.getExperimentType().getTitle());
		return "core0_inventory_managment";
	}
}
