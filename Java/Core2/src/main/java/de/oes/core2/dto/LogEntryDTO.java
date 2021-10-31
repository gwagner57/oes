package de.oes.core2.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder(setterPrefix = "with")
public class LogEntryDTO {
	private Integer simStep;
	private Double time;
	private String systemState;
	private String futureEvents;
}
