class MedicalDepartment extends oBJECT {
  constructor({ id, name, nmrOfAvailDoctors}) {
    super( id, name);
    this.nmrOfAvailDoctors = nmrOfAvailDoctors;
    this.plannedExaminations = [];  // a queue
  }
  isDoctorAvailable() {return this.nmrOfAvailDoctors > 0;}
  allocateDoctor() {this.nmrOfAvailDoctors--;}
  releaseDoctor() {this.nmrOfAvailDoctors++;}
}
MedicalDepartment.labels = {"nmrOfAvailDoctors":"avDocs"};
