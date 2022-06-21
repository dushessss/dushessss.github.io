const URL_playerData = "https://open.faceit.com/data/v4/players/"; //Followed by PID
const URL_players_by_nickname = "https://open.faceit.com/data/v4/players?nickname="; //Followed by PID
let API_KEY;
let player_id;
let nickname;
let player_data;
nickname = "dushesssss";
API_KEY = "18ef3ccf-8384-4955-be81-b4de08a84e19";

$(document).ready(() => {
    console.log("Script loaded");
    setVarsFromQuery();
    if (!nickname) {
        $('.card-body').text(
            "Missing Nickname, cant continue. Please consult the instructions."
        );
        return;
    }
    if (!API_KEY) {
        $('.card-body').text(
            "Missing API_KEY, cant continue. Please consult the instructions."
        );
        return;
    }
    getPlayerIDByName(nickname).then(
        () => {
            setCSGOData();
            setPlayerDailyWR();
            setInterval(() => {
                setCSGOData();
                setPlayerDailyWR();
            }, 30000);
        }
    );
    if (0) {
        fcapi_http_get(URL_playerData + player_id).then((data) => {
            console.log("Success API Call");
            console.log(data);
        }).catch((data) => {
            console.log("API call failed");
            console.log(data);
        }
        );
    }
}
);

function setVarsFromQuery() {
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("nickname")) {
        nickname = urlParams.get("nickname");
    }
    if (urlParams.has("api_key")) {
        API_KEY = urlParams.get("api_key");
    }
}


function setCSGOData() {
    if (player_data.games.hasOwnProperty("csgo")) {
        let csgoinfo = player_data.games.csgo;
        let skill_lvl = csgoinfo.skill_level;
        let faceit_elo = csgoinfo.faceit_elo;
        let lvl_selector = $('#faceitlvl');
        lvl_selector.text(skill_lvl);
        let eloselector = $('#faceitelo');
        eloselector.text(faceit_elo + " ELO " + skill_lvl + " LVL");
        let fac = document.getElementById("faceitelo");
        fac.setAttribute("data-text", faceit_elo + " ELO " + skill_lvl + " LVL");
        if (skill_lvl === 1) {
            lvl_selector.css("color", "snow");
        } else if (skill_lvl < 4 && skill_lvl > 1) {
            lvl_selector.css("color", "limegreen")
        } else if (skill_lvl > 3 && skill_lvl < 8) {
            lvl_selector.css("color", "yellow")
        } else if (skill_lvl > 7 && skill_lvl < 10) {
            lvl_selector.css("color", "orange")
        } else if (skill_lvl === 10) {
            lvl_selector.css("color", "red")
        }
    }
}

function setPlayerDailyWR() {
    let games_won = 0;
    let games_total = 0;
    getPlayerCSGOGamesHistory().then(
        (response) => {
            let matches_played = response.items;
            games_total = matches_played.length;

            function getPlayerFaction(match) {
                if (match.teams.faction1.players.find((player) => {
                    return player.player_id === player_id
                })) {
                    return "faction1";
                } else {
                    return "faction2";
                }
            }

            for (let match of matches_played) {
                if (match.results.winner === getPlayerFaction(match)) {
                    games_won++;
                }
            }
            let win_selector = $("#wontoday");
            let total_selector = $("#totaltoday");
            win_selector.text(games_won);
            total_selector.text(games_total);
            if (games_won === games_total && games_total !== 0) {
                win_selector.css("color", "limegreen");
            } else if (games_won > (games_total / 2) && games_won < games_total) {
                win_selector.css("color", "yellow");
            } else if (games_won < games_total / 2) {
                win_selector.css("color", "orange");
            } else if (games_won === 0 && games_total !== 0) {
                win_selector.css("color", "red");
            }
        }
    );
}

function getPlayerIDByName(name) {
    return new Promise(resolve => {
        fcapi_http_get(URL_players_by_nickname + `${name}`).then(
            (response) => {
                let p_data = response;
                console.log("Discovered the player ID: " + p_data.player_id);
                player_data = p_data;
                player_id = p_data.player_id;
                resolve();
            }
        )
    });
}

function getPlayerCSGOGamesHistory() {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let timestamp = today.getTime() / 1000;
    return new Promise(resolve => {
        fcapi_http_get(URL_playerData + `${player_id}/history?game=csgo&from=${timestamp}`).then(
            (response) => {
                resolve(response);
            }
        )
    });
}

function fcapi_http_get(url) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', `Bearer ${API_KEY}`);
            }
        }).done((data) => resolve(data)).fail((data) => reject(data));
    });
}
class Stage {
    constructor() {
      this.renderParam = {
        clearColor: 0x666666,
        width: window.innerWidth,
        height: window.innerHeight
      };
  
      this.cameraParam = {
        left: -1,
        right: 1,
        top: 1,
        bottom: 1,
        near: 0,
        far: -1
      };
  
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.geometry = null;
      this.material = null;
      this.mesh = null;
  
      this.isInitialized = false;
    }
  
    init() {
      this._setScene();
      this._setRender();
      this._setCamera();
  
      this.isInitialized = true;
    }
  
    _setScene() {
      this.scene = new THREE.Scene();
    }
  
    _setRender() {
      this.renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById("webgl-canvas")
      });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setClearColor(new THREE.Color(this.renderParam.clearColor));
      this.renderer.setSize(this.renderParam.width, this.renderParam.height);
    }
  
    _setCamera() {
      if (!this.isInitialized) {
        this.camera = new THREE.OrthographicCamera(
          this.cameraParam.left,
          this.cameraParam.right,
          this.cameraParam.top,
          this.cameraParam.bottom,
          this.cameraParam.near,
          this.cameraParam.far
        );
      }
      
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
  
      this.camera.aspect = windowWidth / windowHeight;
  
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(windowWidth, windowHeight);
    }
  
    _render() {
      this.renderer.render(this.scene, this.camera);
    }
  
    onResize() {
      this._setCamera();
    }
  
    onRaf() {
      this._render();
    }
  }
  
  class Mesh {
    constructor(stage) {
      this.canvas = document.getElementById("webgl-canvas");
      this.canvasWidth = this.canvas.width;
      this.canvasHeight = this.canvas.height;
  
      this.uniforms = {
        resolution: { type: "v2", value: [ this.canvasWidth, this.canvasHeight ] },
        time: { type: "f", value: 0.0 },
        xScale: { type: "f", value: 1.0 },
        yScale: { type: "f", value: 0.5 },
        distortion: { type: "f", value: 0.050 }
      };
  
      this.stage = stage;
  
      this.mesh = null;
      
      this.xScale = 1.0;
      this.yScale = 0.5;
      this.distortion = 0.050;
    }
  
    init() {
      this._setMesh();
      // this._setGui();
    }
  
    _setMesh() {
      const position = [
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0
      ];
  
      const positions = new THREE.BufferAttribute(new Float32Array(position), 3);
  
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", positions);
  
      const material = new THREE.RawShaderMaterial({
        vertexShader: document.getElementById("js-vertex-shader").textContent,
        fragmentShader: document.getElementById("js-fragment-shader").textContent,
        uniforms: this.uniforms,
        side: THREE.DoubleSide
      });
  
      this.mesh = new THREE.Mesh(geometry, material);
  
      this.stage.scene.add(this.mesh);
    }
    
    _diffuse() {
      // gsap.to(this.mesh.material.uniforms.xScale, {
      //   value: 2,
      //   duration: 0.1,
      //   ease: 'power2.inOut',
      //   repeat: -1,
      //   yoyo: true
      // });
      // gsap.to(this.mesh.material.uniforms.yScale, {
      //   value: 1,
      //   duration: 0.1,
      //   ease: 'power2.inOut',
      //   repeat: -1,
      //   yoyo: true
      // });
    }
    
    _render() {
      this.uniforms.time.value += 0.01;
    }
  
    _setGui() {
      const parameter = {
        xScale: this.xScale,
        yScale: this.yScale,
        distortion: this.distortion
      }
      const gui = new dat.GUI();
      gui.add(parameter, "xScale", 0.00, 5.00, 0.01).onChange((value) => {
        this.mesh.material.uniforms.xScale.value = value;
      });
      gui.add(parameter, "yScale", 0.00, 1.00, 0.01).onChange((value) => {
        this.mesh.material.uniforms.yScale.value = value;
      });
      gui.add(parameter, "distortion", 0.001, 0.100, 0.001).onChange((value) => {
        this.mesh.material.uniforms.distortion.value = value;
      });
    }
  
    onRaf() {
      this._render();
    }
  }
  
  (() => {
    const stage = new Stage();
  
    stage.init();
  
    const mesh = new Mesh(stage);
  
    mesh.init();
  
    window.addEventListener("resize", () => {
      stage.onResize();
    });
    
    window.addEventListener("load", () => {
      setTimeout(() => {
        mesh._diffuse();
      }, 1000);
    });
  
    const _raf = () => {
      window.requestAnimationFrame(() => {
        stage.onRaf();
        mesh.onRaf();
  
        _raf();
      });
    };
  
    _raf();
  })();
  $(document).on("keydown", disableF5);