package de.oes.core2.sim;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class GenericStat {
	private Number value;
	private Number max;
}
