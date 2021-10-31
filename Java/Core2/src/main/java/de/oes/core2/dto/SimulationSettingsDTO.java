package de.oes.core2.dto;

import lombok.AllArgsConstructor;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationSettingsDTO {
	
	private long init;
	private long type;
	private boolean simulationLog;
}
