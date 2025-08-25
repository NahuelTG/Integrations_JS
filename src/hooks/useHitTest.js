// hooks/useHitTest.js
import { useState, useRef, useCallback } from "react";
import * as THREE from "three";

export const useHitTest = (renderer, reticle, pointer, camera, isStartedRef, setIsTracked) => {
   const [surfaceDetected, setSurfaceDetected] = useState(false);
   const hitTestSourceRef = useRef(null);
   const hitTestSourceRequestedRef = useRef(false);

   const processHitTest = useCallback(
      (frame) => {
         if (!isStartedRef.current || !frame || !renderer) return;

         const referenceSpace = renderer.xr.getReferenceSpace();
         const session = renderer.xr.getSession();

         // Hit test setup
         if (hitTestSourceRequestedRef.current === false) {
            session.requestReferenceSpace("viewer").then((referenceSpace) => {
               session.requestHitTestSource({ space: referenceSpace }).then((source) => {
                  hitTestSourceRef.current = source;
               });
            });

            session.addEventListener("end", () => {
               hitTestSourceRequestedRef.current = false;
               hitTestSourceRef.current = null;
               setSurfaceDetected(false);
            });

            hitTestSourceRequestedRef.current = true;
         }

         // Hit test results
         if (hitTestSourceRef.current) {
            const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);

            if (hitTestResults.length) {
               const hit = hitTestResults[0];

               if (reticle) {
                  reticle.visible = true;
                  reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
               }

               if (pointer && camera) {
                  pointer.visible = true;
                  const reticlePos = new THREE.Vector3().setFromMatrixPosition(reticle.matrix);
                  const cameraPos = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);

                  pointer.position.copy(reticlePos);
                  pointer.position.y = cameraPos.y;
               }

               setSurfaceDetected(true);
               if (setIsTracked) setIsTracked(true);
            } else {
               if (reticle) reticle.visible = false;
               if (pointer) pointer.visible = false;
               setSurfaceDetected(false);
            }
         }
      },
      [renderer, reticle, pointer, camera, isStartedRef, setIsTracked]
   );

   return {
      surfaceDetected,
      processHitTest,
   };
};
