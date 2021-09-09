package de.oes.core1;

import java.util.Collection;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import de.oes.core1.endpoint.activity.RunInventoryManagmentSimulation;
import de.oes.core1.endpoint.ui.SimulationSettingsDTO;

@SpringBootTest
public class InventoryManagmentTest {

	
	@Autowired
	private RunInventoryManagmentSimulation sim;
	
	@Test
	public void testSuccess() throws Exception {
		SimulationSettingsDTO dto = new SimulationSettingsDTO();
		dto.setInit(2);
		dto.setType(1);
		dto.setSimulationLog(false);
		org.springframework.ui.Model m = new org.springframework.ui.Model() {
			
			@Override
			public org.springframework.ui.Model mergeAttributes(Map<String, ?> attributes) {
				// TODO Auto-generated method stub
				return null;
			}
			
			@Override
			public Object getAttribute(String attributeName) {
				// TODO Auto-generated method stub
				return null;
			}
			
			@Override
			public boolean containsAttribute(String attributeName) {
				// TODO Auto-generated method stub
				return false;
			}
			
			@Override
			public Map<String, Object> asMap() {
				// TODO Auto-generated method stub
				return null;
			}
			
			@Override
			public org.springframework.ui.Model addAttribute(String attributeName, Object attributeValue) {
				// TODO Auto-generated method stub
				return null;
			}
			
			@Override
			public org.springframework.ui.Model addAttribute(Object attributeValue) {
				// TODO Auto-generated method stub
				return null;
			}
			
			@Override
			public org.springframework.ui.Model addAllAttributes(Map<String, ?> attributes) {
				// TODO Auto-generated method stub
				return null;
			}
			
			@Override
			public org.springframework.ui.Model addAllAttributes(Collection<?> attributeValues) {
				// TODO Auto-generated method stub
				return null;
			}
		};
		sim.run(dto, m);
	}
}
