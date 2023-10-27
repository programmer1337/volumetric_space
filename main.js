import * as THREE from 'three';

import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';

let container;

let camera, scene, renderer;
let linesGroup, dotsGroup, textGroup;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// GRID SETTINGS
// --BACKGROUND GRID
// --DEFAULT SETTING
/*let xLinesCountDivideTwo = 7, yLinesCount = 12,
    curveBending = 1200,
// --ADDITIONAL VARIABLES
let countOfXLineDots = 150,
    xLineWidth = 700, yLineHeight = 1000;
// --STYLE
let lineDotWeight = 1.4, nodeDotWeight = 4, textSize = 14;

//CALCULATE DOTS DISTANCES
let dotsBetweenXLines = 6, distanceBetweenXLines = 120;
let PD = distanceBetweenXLines / dotsBetweenXLines;
let space = (yLineHeight * 2) / PD;

//CAMERA
let xSideSpeed = window.innerWidth * 1.5, // * 1.5
    ySideSpeed = window.innerHeight * 3.5, // * 4.5
    cameraXBorder = 0.4, cameraYBorder = 0.4; // /1000, 0.4*/

// --TESTING
let xLinesCountDivideTwo = 5, yLinesCount = 10,
    curveBending = 600;
// --ADDITIONAL VARIABLES
let countOfXLineDots = 150,
    xLineWidth = 350, yLineHeight = 500;
// --STYLE
let lineDotWeight = 0.6, nodeDotWeight = 2, textSize = 6; // , 14

//CALCULATE DOTS DISTANCES
let dotsBetweenXLines = 6, distanceBetweenXLines = 60;
let PD = distanceBetweenXLines / dotsBetweenXLines;
let space = (yLineHeight * 2) / PD;

//CAMERA
let xSideSpeed = window.innerWidth * 1.5, // * 1.5
    ySideSpeed = window.innerHeight * 3.5, // * 4.5
    cameraXBorder = 0.4, cameraYBorder = 0.4, // /1000, 0.4
    cameraZ = -125; // -225

let labelRenderer

init();
animate();

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 400);
    camera.position.set(0, 50, cameraZ);

    /*camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 1200);
    camera.position.set(25, 100, cameraZ);*/

    /*camera = new THREE.PerspectiveCamera(110, window.innerWidth / window.innerHeight, 1, 1200);
    camera.position.set(50, 75, -100);*/
    scene.add(camera);

    linesGroup = new THREE.Group();
    linesGroup.position.y = 50;

    dotsGroup = new THREE.Group();
    dotsGroup.position.y = 50;

    textGroup = new THREE.Group();
    textGroup.position.y = 50;
    scene.add(linesGroup, dotsGroup, textGroup);

    function createSpacedPoint(shape, space) {
        return shape.getSpacedPoints(space);
    }

    function addLineShape(shape, color, x, y, z, rx, ry, rz, s, space) {
        shape.autoClose = true;

        const spacedPoints = createSpacedPoint(shape, space);
        const geometrySpacedPoints = new THREE.BufferGeometry().setFromPoints(spacedPoints)

        let particles = new THREE.Points(geometrySpacedPoints, new THREE.PointsMaterial({
            color: color,
            size: lineDotWeight
        }))

        particles.position.set(x, y, z);
        particles.rotation.set(rx, ry, rz);
        particles.scale.set(s, s, s);

        linesGroup.add(particles);
    }

    function addDotShape(coordinates, color, rx, ry, rz, s) {
        /*const geometry = new THREE.CircleGeometry(nodeDotWeight, 40);*/
        let geometryInnerSphere = new THREE.SphereGeometry(nodeDotWeight, 36, 18);
        let materialInnerSphere = new THREE.MeshBasicMaterial({color: color});
        let innerSphere = new THREE.Mesh(geometryInnerSphere, materialInnerSphere);

        innerSphere.position.set(coordinates.x, coordinates.y, coordinates.z + 1);
        innerSphere.rotation.set(rx, ry, rz);
        innerSphere.scale.set(s, s, s);
        innerSphere.userData.isNode = true;

        dotsGroup.add(innerSphere);

        let geometryOuterSphere = new THREE.SphereGeometry(nodeDotWeight * 4, 72, 36);
        let materialOuterSphere = new THREE.MeshPhongMaterial({
            color: 0x131fff,
            opacity: 0,
            transparent: true,
        });
        let outerSphere = new THREE.Mesh(geometryOuterSphere, materialOuterSphere);

        outerSphere.position.set(coordinates.x, coordinates.y, coordinates.z + 1);
        outerSphere.rotation.set(rx, ry, rz);
        outerSphere.scale.set(s, s, s);
        outerSphere.userData.isNode = true;
        outerSphere.userData.type = "sphere";
        outerSphere.userData.innerNode = innerSphere;

        dotsGroup.add(outerSphere);

        return outerSphere;
    }

    function addText(node, text, coordinates, points, column, color, rx, ry, rz, s) {
        const loader = new FontLoader();
        let box3, width, height;

        loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
            let textGeometry = new TextGeometry(text, {
                font: font,
                size: textSize,
                height: 0,
                curveSegments: 12,
            });

            let material = new THREE.MeshBasicMaterial({
                color: color,
            });

            let mesh = new THREE.Mesh(textGeometry, material);

            mesh.position.set(coordinates.x + 5, coordinates.y - 15, coordinates.z);
            mesh.rotation.set(rx, ry, rz);
            mesh.scale.set(s, s, s);

            mesh.userData.isNode = true;
            mesh.userData.type = "text";
            mesh.userData.withNode = node;
            node.userData.text = mesh;

            textGroup.add(mesh);

            //

            box3 = new THREE.Box3().setFromObject(mesh);
            width = box3.max.x - box3.min.x;
            height = box3.max.y - box3.min.y;

            let textBackgroundGeometry = new THREE.PlaneGeometry(width * 1.1, height * 3);
            let textBackgroundMaterial = new THREE.MeshBasicMaterial({
                color: 0x131fff,
                opacity: 0,
                transparent: true,
            })
            let textBackgroundMesh = new THREE.Mesh(textBackgroundGeometry, textBackgroundMaterial);

            textBackgroundMesh.position.set(coordinates.x + 25, coordinates.y - 10, coordinates.z - 1);
            mesh.rotation.set(rx, ry, rz);
            mesh.scale.set(s, s, s);

            textBackgroundMesh.userData.isNode = true;
            textBackgroundMesh.userData.type = "textBackground";
            textBackgroundMesh.userData.withNode = node;
            textBackgroundMesh.userData.text = mesh;

            textGroup.add(textBackgroundMesh);
        })
    }

    function addPointAndText(row, column, text) {
        let shape = massiveOfXLines.find(line => line.row === row);
        let points = createSpacedPoint(shape.line, countOfXLineDots);
        let sphere = addDotShape(points[15 * column], 0x000, 0, 0, 0, 1);

        addText(sphere, text, points[15 * column], points, column, 0x000, 0, 0, 0, 1);

        /*addText(text, points[15 * column], 0x000, 0, 0, 0, 1);*/
        /*addText(text, points[15 * column], points, column, 0x000, 0, 0, 0, 1);*/
    }

    //3D GRID
    let newLine, massiveOfXLines = [], spacedPoints, level;

    //--HORIZONTAL LINES
    newLine = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-xLineWidth, 0, 0),
        new THREE.Vector3(0, 0, -curveBending),
        new THREE.Vector3(xLineWidth, 0, 0)
    )
    massiveOfXLines.push({row: 0, line: newLine})
    addLineShape(newLine, 0x000, 0, 0, 0, 0, 0, 0, 1, countOfXLineDots);
    spacedPoints = createSpacedPoint(newLine, countOfXLineDots);

    for (let i = 1; i < xLinesCountDivideTwo; i++) {
        level = distanceBetweenXLines * i;
        newLine = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(-xLineWidth, level, 0),
            new THREE.Vector3(0, level, -curveBending),
            new THREE.Vector3(xLineWidth, level, 0)
        )
        massiveOfXLines.push({row: i, line: newLine})
        addLineShape(newLine, 0x000, 0, 0, 0, 0, 0, 0, 1, countOfXLineDots);

        newLine = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(-xLineWidth, -level, 0),
            new THREE.Vector3(0, -level, -curveBending),
            new THREE.Vector3(xLineWidth, -level, 0)
        )
        massiveOfXLines.push({row: -i, line: newLine})
        addLineShape(newLine, 0x000, 0, 0, 0, 0, 0, 0, 1, countOfXLineDots);
    }

    massiveOfXLines.sort((a, b) => a.line.v0.y - b.line.v0.y);

    //--VERTICAL LINES
    let currentX, currentZ;
    for (let i = 0; i < yLinesCount - 1; i++) {
        currentX = spacedPoints[i * 15]?.x ? spacedPoints[i * 15].x : 1000;
        currentZ = spacedPoints[i * 15]?.z ? spacedPoints[i * 15].z : 1000;

        newLine = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(currentX, yLineHeight, currentZ),
            new THREE.Vector3(currentX, 0, currentZ),
            new THREE.Vector3(currentX, -yLineHeight, currentZ)
        )

        addLineShape(newLine, 0x000, 0, 0, 0, 0, 0, 0, 1, space);
    }

    //--NODES WITH TEXT
    let massiveOfNode = [
        {row: 0, column: 4, text: "KITTY R0C4"},
        {row: 0, column: 5, text: "KITTY R0C5"},
        {row: 1, column: 4, text: "KITTY R1C4"},
        {row: 1, column: 5, text: "KITTY R1C5"},
        {row: 2, column: 3, text: "KITTY R2C3"},
        {row: -1, column: 6, text: "KITTY R-1C5"},
    ];
    for (let i = 0; i < massiveOfNode.length; i++) {
        addPointAndText(massiveOfNode[i].row, massiveOfNode[i].column, massiveOfNode[i].text);
    }

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    container.style.touchAction = 'none';

    container.addEventListener('click', onMouseClick);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);
}

//--------------------------------------------------------------------//

let popUpContainer = document.getElementById("pop-up-container"),
    popUpContent = document.getElementById("pop-up");

popUpContent.addEventListener("click", e => {
    e.stopPropagation();
})
popUpContainer.addEventListener("click", () => {
    popUpContainer.style.display = "none";
})

let positionX, positionY,
    newRotationX, newRotationY,
    obj;

const raycaster = new THREE.Raycaster();
const mouseClick = new THREE.Vector2();
const pointer = new THREE.Vector2();

function onMouseClick(event) {
    mouseClick.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseClick.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouseClick, camera);

    let intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length !== 0) {
        obj = intersects[0].object;
        if (obj.userData.isNode) {
            popUpContainer.style.display = "flex";
            //TODO изменить пунктир на линии
            //TODO добавить анимацию линиям
        }
    }
}

function onMouseMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    let intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length !== 0) {
        if (intersects[0].object.userData.isNode) {
            obj = intersects[0].object;

            container.style.cursor = "pointer";

            if (obj.userData.type === "text") {
                obj.material.color.setHex(0x0F4DBC);
                obj.userData.withNode.userData.innerNode.material.color.setHex(0x0F4DBC);
            }
            if (obj.userData.type === "textBackground") {
                obj.userData.text.material.color.setHex(0x0F4DBC);
                obj.userData.text.userData.withNode.userData.innerNode.material.color.setHex(0x0F4DBC);
            }
            if (obj.userData.type === "sphere") {
                obj.userData.text.material.color.setHex(0x0F4DBC);
                obj.userData.innerNode.material.color.setHex(0x0F4DBC);
            }
        }
    } else {
        container.style.cursor = "default";

        if (obj !== undefined) {
            if (obj.userData.type === "text") {
                obj.material.color.setHex(0x000000);
                obj.userData.withNode.userData.innerNode.material.color.setHex(0x000000);
            }
            if (obj.userData.type === "textBackground") {
                obj.userData.text.material.color.setHex(0x000000);
                obj.userData.text.userData.withNode.userData.innerNode.material.color.setHex(0x000000);
            }
            if (obj.userData.type === "sphere") {
                obj.userData.text.material.color.setHex(0x000000);
                obj.userData.innerNode.material.color.setHex(0x000000);
            }
        }
    }

    positionX = event.clientX - windowHalfX;
    positionY = event.clientY - windowHalfY;

    newRotationX = positionY / ySideSpeed;
    newRotationY = positionX / xSideSpeed;

    if (newRotationX > -cameraXBorder && newRotationX < cameraXBorder) {
        camera.rotation.x = -newRotationX;
    }

    if (newRotationY > -cameraYBorder && newRotationY < cameraYBorder) {
        camera.rotation.y = -newRotationY;
    }
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    xSideSpeed = window.innerWidth * 1.5;
    ySideSpeed = window.innerHeight * 3.5;
    cameraXBorder = 0.4;
    cameraYBorder = 0.4;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    /*labelRenderer.setSize(window.innerWidth, window.innerHeight);*/
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    /*labelRenderer.render(scene, camera);*/
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}
