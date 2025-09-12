import * as THREE from 'three';

export const degToRad = (degree: number) => {
  return degree * Math.PI / 180;
};

export const radToDeg = (radian: number) => {
  return radian * 180 / Math.PI;
};

export const createQuaternionFromAngles = (
  pitchDeg: number,  // Rotation X (haut/bas)
  yawDeg: number,    // Rotation Y (gauche/droite)
  rollDeg: number    // Rotation Z (inclinaison)
) => {
  const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), degToRad(pitchDeg));
  const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), degToRad(yawDeg));
  const qZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), degToRad(rollDeg));
  
  return qY.multiply(qX).multiply(qZ);
};

export const createScreenQuaternion = (tiltDeg: number, turnDeg: number) => {
  const tiltQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), degToRad(tiltDeg));
  const turnQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), degToRad(turnDeg));
  
  return turnQ.multiply(tiltQ);
};