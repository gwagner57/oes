class MedicalDepartment extends oBJECT {
  constructor({ id, name, nmrOfAvailRooms, nmrOfAvailDoctors}) {
    super( id, name);
    this.nmrOfAvailRooms = nmrOfAvailRooms;
    this.nmrOfAvailDoctors = nmrOfAvailDoctors;
    this.plannedExaminations = [];  // a queue
  }
  isRoomAvailable() {
    return this.nmrOfAvailRooms > 0;
  }
  allocateRoom() {
    this.nmrOfAvailRooms--;
  }
  releaseRoom() {
    this.nmrOfAvailRooms++;
  }
  isDoctorAvailable() {
    return this.nmrOfAvailDoctors > 0;
  }
  allocateDoctor() {
    this.nmrOfAvailDoctors--;
  }
  releaseDoctor() {
    this.nmrOfAvailDoctors++;
  }
}
MedicalDepartment.labels = {"nmrOfAvailRooms":"avRooms", "nmrOfAvailDoctors":"avDocs"};
