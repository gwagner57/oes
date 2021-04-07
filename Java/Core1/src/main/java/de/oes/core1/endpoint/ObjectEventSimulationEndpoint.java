package de.oes.core1.endpoint;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import de.oes.core1.endpoint.ui.SimulationSettingsDTO;

@Controller
public class ObjectEventSimulationEndpoint {

	@RequestMapping("/")
	public String index() {
	    return "index";
	}
	
	@GetMapping("/core1/servicedesk/settings")
	public String setupServicedesk(Model m) {
		m.addAttribute("scenario", new SimulationSettingsDTO());
	    return "servicedesk-settings";
	}
	
	@PostMapping("/core1/servicedesk/settings")
    public String runServicedesk(SimulationSettingsDTO dto, Model model) {
        model.addAttribute("scenario", dto);
        return "servicedesk";
	}
	
	@RequestMapping("/core1/workstation/settings")
	public String runWorkstation() {
	    return "index";
	}
}
