package de.oes.core1.endpoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import de.oes.core1.endpoint.activity.RunServiceDeskSimulation;
import de.oes.core1.endpoint.activity.RunWorkstationSimulation;
import de.oes.core1.endpoint.ui.SimulationSettingsDTO;

@Controller
public class ObjectEventSimulationEndpoint {

	@Autowired
	private RunServiceDeskSimulation serviceDesk;
	
	@Autowired
	private RunWorkstationSimulation workDesk;
	
	@RequestMapping("/")
	public String index() {
	    return "index";
	}
	
	@GetMapping("/core1/servicedesk")
	public String setupServicedesk(Model m) {
		m.addAttribute("scenario", new SimulationSettingsDTO());
	    return "servicedesk-settings";
	}
	
	@PostMapping("/core1/servicedesk")
    public String runServicedesk(SimulationSettingsDTO dto, Model model) {
		model.addAttribute("type", dto.getType());
		model.addAttribute("hasLogs", dto.isSimulationLog());
		serviceDesk.run(dto, model);
        return "servicedesk";
	}
	
	@GetMapping("/core1/workstation")
	public String setupWorkstation(Model m) {
		m.addAttribute("scenario", new SimulationSettingsDTO());
	    return "workstation-settings";
	}
	
	@PostMapping("/core1/workstation")
    public String runWorkstation(SimulationSettingsDTO dto, Model model) {
		model.addAttribute("type", dto.getType());
		model.addAttribute("hasLogs", dto.isSimulationLog());
		workDesk.run(dto, model);
        return "workstation";
	}
	
	@RequestMapping("/core1/workstation/settings")
	public String runWorkstation() {
	    return "index";
	}
}
