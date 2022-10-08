import React, { useEffect, useRef } from "react";
import "./Visualiser.css";

function Visualiser(props) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const totalRingPoints = 32;
    const radius = 150;
    const firstRingCoordinates = [];
    const secondRingCoordinates = [];
    const thirdRingCoordinates = [];
    const fourthRingCoordinataes = [];
    const particleCoordinates = [];

    let currentLoudness;

    // Set up the empty 2d particle array for the flying particles
    for (let angle = 0; angle < 360; angle += 6) {
      particleCoordinates.push({
        particleCoordinateArray: [],
        angle: angle,
      });
    }

    // Initialise ring points
    for (let angle = 90; angle < 450; angle += 360 / totalRingPoints) {
      const pointData = JSON.stringify({
        angle: angle,
        x:
          canvas.width / 2 +
          (canvas.height / 6) * Math.cos((-angle * Math.PI) / 180),
        y:
          canvas.height / 2 +
          50 +
          (canvas.height / 6) * Math.sin((-angle * Math.PI) / 180),
        distanceFactor: 1,
      });

      firstRingCoordinates.push(JSON.parse(pointData));
      secondRingCoordinates.push(JSON.parse(pointData));
      thirdRingCoordinates.push(JSON.parse(pointData));
      fourthRingCoordinataes.push(JSON.parse(pointData));
    }

    // Audio setup
    // We're capturing microphone input as it's sadly impossible to access system output audio or Spotify track frequency data
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    if (navigator.getUserMedia) {
      // We'll still call gotStream even if we don't have a stream so we can reuse our rendering logic to at least draw a static ring and flying particles
      navigator.getUserMedia({ video: false, audio: true }, gotStream, () =>
        gotStream(null)
      );
    }

    function gotStream(stream) {
      // We may not have access to the stream if the user denies microphone access or permission is pending
      // We'll initialise an empty dummy frequencyArray for that scenario so that we're able to draw a static ring
      let analyser = null;
      let frequencyArray = new Uint8Array(32);

      // If we do have a stream, we're golden
      if (stream) {
        // Connect the audio stream to the analyser
        const context = new AudioContext();
        const audioStream = context.createMediaStreamSource(stream);
        analyser = context.createAnalyser();
        audioStream.connect(analyser);

        // We'll only use half the frequency range as microphone audio is naturally binned mostly in the low-end
        // Thus, FFT size double the number of points we have
        analyser.fftSize = 2 * totalRingPoints;

        // Buffer to receive the audio data
        const bufferLength = analyser.frequencyBinCount;
        frequencyArray = new Uint8Array(bufferLength);
      }

      // Draw the flying particles
      function renderParticles() {
        particleCoordinates.forEach((position) => {
          position.particleCoordinateArray.forEach((particle) => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            ctx.fill();
          });
        });
      }

      // Draw the ring based on the ring coordinates provided
      function renderRing(coordinateArray, fillColour, outline = false) {
        if (outline) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = "rgba(255, 255, 255, 0.32)";
          ctx.lineWidth = 5;
          ctx.strokeStyle = "white";
        } else {
          ctx.strokeStyle = "transparent";
        }
        ctx.fillStyle = fillColour;
        ctx.beginPath();
        ctx.moveTo(coordinateArray[0].x, coordinateArray[0].y);
        for (let i = 1; i < coordinateArray.length - 1; i++) {
          var xc = (coordinateArray[i].x + coordinateArray[i + 1].x) / 2;
          var yc = (coordinateArray[i].y + coordinateArray[i + 1].y) / 2;
          ctx.quadraticCurveTo(
            coordinateArray[i].x,
            coordinateArray[i].y,
            xc,
            yc
          );
        }
        ctx.quadraticCurveTo(
          coordinateArray[coordinateArray.length - 1].x,
          coordinateArray[coordinateArray.length - 1].y,
          coordinateArray[0].x,
          coordinateArray[0].y
        );
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
      }

      // Update the coordinates of the rings and particles
      function updateCoordinates() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        analyser && analyser.getByteFrequencyData(frequencyArray);

        // Grab the loudest value in the first half of the frequency array (we are only plotting this half)
        const middleIndex = Math.ceil(frequencyArray.length / 2);
        const maxAudioValue =
          Math.max(...frequencyArray.slice(0, middleIndex)) / 255;

        let audioValue;
        let adjustedAudioValue;
        // Iterate through the coordinates making up the left half of the rings
        // The right half will just be a mirror of the left half
        for (let i = 0; i <= middleIndex; i++) {
          audioValue = frequencyArray[i] / 255;

          // Microphone audio is extremely noisy and terrible, we need to clean it up as best we can with fun maths
          // We essentially want to punish the value the quieter it is and exaggerate it the louder it is
          adjustedAudioValue =
            audioValue > 0
              ? Math.pow(audioValue, maxAudioValue / Math.pow(audioValue, 2))
              : 0;

          // We want to amplify the higher frequencies because most microphone input is interpreted as sub-bass
          const baseDistanceFactor =
            1 + (adjustedAudioValue * firstRingCoordinates[i].angle) / 180;

          // Update the distance factor and x and y coordinates at this position on each ring
          // Each ring behaves like the one before it but with more exaggeration on each frequency
          [
            firstRingCoordinates,
            secondRingCoordinates,
            thirdRingCoordinates,
            fourthRingCoordinataes,
          ].forEach((coordinateArray, index) => {
            coordinateArray[i].distanceFactor =
              baseDistanceFactor +
              index * 0.5 * Math.pow(baseDistanceFactor - 1, 2);
            coordinateArray[i].x =
              centerX +
              (radius - index * 5) *
                Math.cos((-coordinateArray[i].angle * Math.PI) / 180) *
                coordinateArray[i].distanceFactor;
            coordinateArray[i].y =
              centerY +
              (radius - index * 5) *
                Math.sin((-coordinateArray[i].angle * Math.PI) / 180) *
                coordinateArray[i].distanceFactor;
          });

          // Right half ring coordinates are just a mirror of the left
          if (i > 0) {
            [
              firstRingCoordinates,
              secondRingCoordinates,
              thirdRingCoordinates,
              fourthRingCoordinataes,
            ].forEach((coordinateArray) => {
              coordinateArray[totalRingPoints - i].x =
                2 * centerX - coordinateArray[i].x;
              coordinateArray[totalRingPoints - i].y = coordinateArray[i].y;
            });
          }
        }

        // The "loudness" will be the largest distanceFactor value of the inner ring coordinates
        currentLoudness = Math.max(
          ...firstRingCoordinates.map((x) => x.distanceFactor)
        );

        updateParticleCoordinates(centerX, centerY, radius);
      }

      // Updates the coordinates of the flying particles
      function updateParticleCoordinates(centerX, centerY, radius) {
        particleCoordinates.forEach((position) => {
          // As the energy factor increases, the chance of a particle being generated should increase
          if (Math.pow(currentLoudness, 2) > Math.random() * 50) {
            position.particleCoordinateArray.push({
              x: centerX + Math.sin((position.angle * Math.PI) / 180) * radius,
              y: centerY + Math.cos((position.angle * Math.PI) / 180) * radius,
              size: Math.random() * 3,
              opacity: Math.random(),
            });
          }

          // Update the x and y coordinates for the particle
          position.particleCoordinateArray.forEach((particle, index) => {
            particle.speed = 2 * Math.pow(currentLoudness, 3) + 1;
            particle.x +=
              Math.sin((position.angle * Math.PI) / 180) * particle.speed;
            particle.y +=
              Math.cos((position.angle * Math.PI) / 180) * particle.speed;

            // If the particle has left the screen, remove it from the array as we no longer need to track it
            if (
              particle.x >= canvas.width ||
              particle.x <= 0 ||
              particle.y >= canvas.height ||
              particle.y <= 0
            ) {
              position.particleCoordinateArray.splice(index, 1);
            }
          });
        });
      }

      function draw() {
        requestAnimationFrame(draw);

        // Resize the canvas in case the browser window has been resized
        // This is a cleaner way of doing it as we don't need to listen for the resize event or interrupt the animation
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        updateCoordinates();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        renderParticles();

        renderRing(
          fourthRingCoordinataes,
          `hsl(${currentLoudness * 360 + 40}, 100%, 50%)`
        );

        renderRing(
          thirdRingCoordinates,
          `hsl(${currentLoudness * 360 + 80}, 100%, 50%)`
        );

        renderRing(
          secondRingCoordinates,
          `hsl(${currentLoudness * 360 + 120}, 100%, 50%)`
        );

        renderRing(firstRingCoordinates, "black", true);
      }

      draw();
    }
  }, [props.hasMicrophoneAccess]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
    ></canvas>
  );
}

export default Visualiser;
