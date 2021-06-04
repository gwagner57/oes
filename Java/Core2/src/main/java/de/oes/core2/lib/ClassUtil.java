package de.oes.core2.lib;

import java.util.Map;

import de.oes.core2.activities.aCTIVITY;

public class ClassUtil {

	private static Map <String, Class<? extends aCTIVITY>> activityClasses;
	
	public static Class<? extends aCTIVITY> getActivityClass(String name) {
		Class<? extends aCTIVITY> c= activityClasses.get(name);
		if(c == null) {
			throw new IllegalStateException("Activity class with the name " + name + " not found!");
		}
		return c;
	}
	
}
