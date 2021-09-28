package de.oes.core2.endpoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import de.oes.core2.dto.SimulationSettingsDTO;
import de.oes.core2.endpoint.acitivity.RunMakeAndDeliverPizzaSimulationActivity;
import de.oes.core2.endpoint.acitivity.RunLoadHaulDumpSimulationActivity;
import de.oes.core2.endpoint.acitivity.RunMedicalDepartment1aSimulationActivity;
import de.oes.core2.endpoint.acitivity.RunMedicalDepartment1bSimulationActivity;
import de.oes.core2.endpoint.acitivity.RunMedicalDepartment1cSimulationActivity;
import de.oes.core2.endpoint.acitivity.RunMedicalDepartment2aSimulationActivity;
import de.oes.core2.endpoint.acitivity.RunMedicalDepartment2bSimulationActivity;
import de.oes.core2.endpoint.acitivity.RunPizzaService1SimulationActivity;
import de.oes.core2.endpoint.acitivity.RunPizzaService2SimulationActivity;

@Controller
public class MaintainObjectEventSimulationsEndpoint {

	@Autowired
	private RunPizzaService1SimulationActivity pizzaService1;
	
	@Autowired
	private RunPizzaService2SimulationActivity pizzaService2;
	
	@Autowired
	private RunMakeAndDeliverPizzaSimulationActivity makeAndDeliver;
	
	@Autowired
	private RunLoadHaulDumpSimulationActivity loadHaulDumpSimulation;
	
	@Autowired
	private RunMedicalDepartment1aSimulationActivity runMedDep1a;
	
	@Autowired
	private RunMedicalDepartment1bSimulationActivity runMedDep1b;
	
	@Autowired
	private RunMedicalDepartment1cSimulationActivity runMedDep1c;
	
	@Autowired
	private RunMedicalDepartment2aSimulationActivity runMedDep2a;
	
	@Autowired
	private RunMedicalDepartment2bSimulationActivity runMedDep2b;
	
	@RequestMapping("/")
	public String index() {
	    return "index";
	}
	
	@GetMapping("/core2/pizzaservice1")
	public String setupPizzaService1(Model m) {
		m.addAttribute("scenario", new SimulationSettingsDTO());
	    return "pizzaservice1-settings";
	}
	
	@PostMapping("/core2/pizzaservice1")
    public String runPizzaService1(SimulationSettingsDTO dto, Model model) {
		model.addAttribute("type", dto.getType());
		model.addAttribute("hasLogs", dto.isSimulationLog());
		pizzaService1.run(dto, model);
        return "pizzaservice1";
	}
	
	@GetMapping("/core2/pizzaservice2")
	public String setupPizzaService2(Model m) {
		m.addAttribute("scenario", new SimulationSettingsDTO());
	    return "pizzaservice2-settings";
	}
	
	@PostMapping("/core2/pizzaservice2")
    public String runPizzaService2(SimulationSettingsDTO dto, Model model) {
		model.addAttribute("type", dto.getType());
		model.addAttribute("hasLogs", dto.isSimulationLog());
		pizzaService2.run(dto, model);
        return "pizzaservice2";
	}
	
	@GetMapping("/core2/makeanddeliver")
	public String setupMakeAndDeliver(Model m) {
		m.addAttribute("scenario", new SimulationSettingsDTO());
	    return "makeanddeliver-settings";
	}
	
	@PostMapping("/core2/makeanddeliver")
    public String runMakeAndDeliver(SimulationSettingsDTO dto, Model model) {
		model.addAttribute("type", dto.getType());
		model.addAttribute("hasLogs", dto.isSimulationLog());
		makeAndDeliver.run(dto, model);
        return "makeanddeliver";
	}
	
	@GetMapping("/core2/loadhauldump")
	public String setupLoadHaulDump(Model m) {
		m.addAttribute("scenario", new SimulationSettingsDTO());
	    return "loadhauldump-settings";
	}
	
	@PostMapping("/core2/loadhauldump")
    public String runLoadHaulDump(SimulationSettingsDTO dto, Model model) {
		model.addAttribute("type", dto.getType());
		model.addAttribute("hasLogs", dto.isSimulationLog());
		loadHaulDumpSimulation.run(dto, model);
        return "loadhauldump";
	}
	
	@GetMapping("/core2/medical-department-1a")
	public String setupMedDep1a(Model m) {
		m.addAttribute("scenario", new SimulationSettingsDTO());
	    return "medical-department-1a-settings";
	}
	
	@PostMapping("/core2/medical-department-1a")
    public String runMedDep1a(SimulationSettingsDTO dto, Model model) {
		model.addAttribute("type", dto.getType());
		model.addAttribute("hasLogs", dto.isSimulationLog());
		runMedDep1a.run(dto, model);
        return "medical-department-1a";
	}
	
	@GetMapping("/core2/medical-department-1b")
	public String setupMedDep1b(Model m) {
		m.addAttribute("scenario", new SimulationSettingsDTO());
	    return "medical-department-1b-settings";
	}
	
	@PostMapping("/core2/medical-department-1b")
    public String runMedDep1b(SimulationSettingsDTO dto, Model model) {
		model.addAttribute("type", dto.getType());
		model.addAttribute("hasLogs", dto.isSimulationLog());
		runMedDep1b.run(dto, model);
        return "medical-department-1b";
	}
	
	@GetMapping("/core2/medical-department-1c")
	public String setupMedDep1c(Model m) {
		m.addAttribute("scenario", new SimulationSettingsDTO());
	    return "medical-department-1c-settings";
	}
	
	@PostMapping("/core2/medical-department-1c")
    public String runMedDep1c(SimulationSettingsDTO dto, Model model) {
		model.addAttribute("type", dto.getType());
		model.addAttribute("hasLogs", dto.isSimulationLog());
		runMedDep1c.run(dto, model);
        return "medical-department-1c";
	}
	
	@GetMapping("/core2/medical-department-2a")
	public String setupMedDep2a(Model m) {
		m.addAttribute("scenario", new SimulationSettingsDTO());
	    return "medical-department-2a-settings";
	}
	
	@PostMapping("/core2/medical-department-2a")
    public String runMedDep2a(SimulationSettingsDTO dto, Model model) {
		model.addAttribute("type", dto.getType());
		model.addAttribute("hasLogs", dto.isSimulationLog());
		runMedDep2a.run(dto, model);
        return "medical-department-2a";
	}
	
	@GetMapping("/core2/medical-department-2b")
	public String setupMedDep2b(Model m) {
		m.addAttribute("scenario", new SimulationSettingsDTO());
	    return "medical-department-2b-settings";
	}
	
	@PostMapping("/core2/medical-department-2b")
    public String runMedDep2b(SimulationSettingsDTO dto, Model model) {
		model.addAttribute("type", dto.getType());
		model.addAttribute("hasLogs", dto.isSimulationLog());
		runMedDep2b.run(dto, model);
        return "medical-department-2b";
	}
}
