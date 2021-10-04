package de.oes.core2.endpoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import de.oes.core2.dto.SimulationSettingsDTO;
import de.oes.core2.endpoint.service.RunLoadHaulDumpSimulationService;
import de.oes.core2.endpoint.service.RunMakeAndDeliverPizzaSimulationService;
import de.oes.core2.endpoint.service.RunMedicalDepartment1aSimulationService;
import de.oes.core2.endpoint.service.RunMedicalDepartment1bSimulationService;
import de.oes.core2.endpoint.service.RunMedicalDepartment1cSimulationService;
import de.oes.core2.endpoint.service.RunMedicalDepartment2aSimulationService;
import de.oes.core2.endpoint.service.RunMedicalDepartment2bSimulationService;
import de.oes.core2.endpoint.service.RunPizzaService1SimulationService;
import de.oes.core2.endpoint.service.RunPizzaService2SimulationService;

@Controller
public class MaintainObjectEventSimulationsEndpoint {

	@Autowired
	private RunPizzaService1SimulationService pizzaService1;
	
	@Autowired
	private RunPizzaService2SimulationService pizzaService2;
	
	@Autowired
	private RunMakeAndDeliverPizzaSimulationService makeAndDeliver;
	
	@Autowired
	private RunLoadHaulDumpSimulationService loadHaulDumpSimulation;
	
	@Autowired
	private RunMedicalDepartment1aSimulationService runMedDep1a;
	
	@Autowired
	private RunMedicalDepartment1bSimulationService runMedDep1b;
	
	@Autowired
	private RunMedicalDepartment1cSimulationService runMedDep1c;
	
	@Autowired
	private RunMedicalDepartment2aSimulationService runMedDep2a;
	
	@Autowired
	private RunMedicalDepartment2bSimulationService runMedDep2b;
	
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
