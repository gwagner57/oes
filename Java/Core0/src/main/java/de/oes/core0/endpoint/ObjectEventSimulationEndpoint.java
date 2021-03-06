package de.oes.core0.endpoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import de.oes.core0.endpoint.activity.RunInventoryManagmentActivity;
import de.oes.core0.endpoint.activity.RunServiceDesk0Activity;
import de.oes.core0.endpoint.activity.RunServiceDesk1Activity;
import de.oes.core0.endpoint.activity.RunServiceDesk2Activity;

@Controller
public class ObjectEventSimulationEndpoint {

	@Autowired
	private RunServiceDesk0Activity serviceDesk0;
	
	@Autowired
	private RunServiceDesk1Activity serviceDesk1;
	
	@Autowired
	private RunServiceDesk2Activity serviceDesk2;
	
	@Autowired
	private RunInventoryManagmentActivity inventoryManagment;
	
	@RequestMapping("/")
	public String index() {
	    return "index";
	}
	
	@RequestMapping("/core0/servicedesk0")
	public String servicedesk0(Model m) {
		this.serviceDesk0.run(m);
	    return "core0_servicedesk0";
	}
	
	@RequestMapping("/core0/servicedesk1")
	public String servicedesk1(Model m) {
		this.serviceDesk1.run(m);
		return "core0_servicedesk1";
	}
	
	@RequestMapping("/core0/servicedesk2")
	public String servicedesk2(Model m) {
		this.serviceDesk2.run(m);
		return "core0_servicedesk2";
	}
	
	@RequestMapping("/core0/inventory-managment")
	public String inventoryManagment(Model m) {
		this.inventoryManagment.run(m);
		return "core0_inventory_managment";
	}
}
