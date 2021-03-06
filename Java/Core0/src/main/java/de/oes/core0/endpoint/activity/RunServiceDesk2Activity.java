package de.oes.core0.endpoint.activity;

import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.function.Supplier;

import org.springframework.stereotype.Component;

import de.oes.core0.endpoint.ui.ExperimentsStatisticsDTO;
import de.oes.core0.lib.MathLib;
import de.oes.core0.servicedesk1.Customer;
import de.oes.core0.servicedesk2.CustomerArrival;
import de.oes.core0.servicedesk2.CustomerDeparture;
import de.oes.core0.servicedesk2.ServiceDesk;
import de.oes.core0.sim.ExperimentType;
import de.oes.core0.sim.Model;
import de.oes.core0.sim.Scenario;
import de.oes.core0.sim.Simulator;
import de.oes.core0.sim.Time;
import de.oes.core0.sim.TimeUnit;

@Component
public class RunServiceDesk2Activity {
	
	public void run(org.springframework.ui.Model m) {
		Model model = new Model();
		model.setTime(Time.CONT);
		model.setTimeUnit(TimeUnit.min);
		model.setObjectTypes(List.of(ServiceDesk.class, Customer.class));
		model.setEventTypes(List.of(CustomerArrival.class, CustomerDeparture.class));
		Supplier<Integer> serviceTime = new Supplier<Integer>() {
			@Override
			public Integer get() {
				Integer r = MathLib.getUniformRandomInteger(0, 99);
				if (r < 30)
					return 2; // probability 0.30
				else if (r < 80)
					return 3; // probability 0.50
				else
					return 4; // probability 0.20
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
			ServiceDesk sd = new ServiceDesk(1, "serviceDesk", sim);
			s.getModel().getV().put("queueLength", Integer.valueOf(0));
			s.getFEL().add(new CustomerArrival(s, 1l, null, sd));
		};
		scenario.setSetupInitialState(setupInitialState);

		Consumer<Simulator> computeFinalStatistics = s -> {
			s.getStat().put("meanTimeInSystem",
					MathLib.round(Double.valueOf(sim.getStat().get("cumulativeTimeInSystem").doubleValue()
							/ sim.getStat().get("departedCustomers").doubleValue())));
		};
		model.setComputeFinalStatisctics(computeFinalStatistics);

		sim.setModel(model);
		sim.setScenario(scenario);
		sim.setExperimentType(new ExperimentType(1, "Simple Experiment with 10 replications, each running for "
				+ sim.getScenario().getDurationInSimTime() + " " + sim.getModel().getTimeUnit(), 10));

		ExperimentsStatisticsDTO expStat = sim.runSimpleExperiment(sim.getExperimentType());
		m.addAttribute("stat", expStat);
		m.addAttribute("expInfo", sim.getExperimentType().getTitle());
	}
}
