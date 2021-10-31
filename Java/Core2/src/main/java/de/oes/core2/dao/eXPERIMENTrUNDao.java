package de.oes.core2.dao;

import java.util.List;



import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import de.oes.core2.entity.eXPERIMENTrUN;

@Repository
@Transactional
public class eXPERIMENTrUNDao {
	
	@PersistenceContext
	private EntityManager entityManager;
	
	public void create(eXPERIMENTrUN e) {
		entityManager.persist(e);
	}
	
	public void merge(eXPERIMENTrUN e) {
		entityManager.merge(e);
	}
	
	public eXPERIMENTrUN update(eXPERIMENTrUN e) {
		return entityManager.merge(e);
	}
	
	public String getEntityName(Class<?> otherEntityClazz) {
		String simpleName = otherEntityClazz.getSimpleName();
		return simpleName;
	}
	
	public List<eXPERIMENTrUN> findAll() {
		return entityManager.createQuery("select e from " + eXPERIMENTrUN.class.getName() + " e", eXPERIMENTrUN.class).getResultList();
	}
}
