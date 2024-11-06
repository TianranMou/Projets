document.addEventListener('DOMContentLoaded', () => {

  const getDataBtn = document.getElementById('getNutData');
  
  getDataBtn.addEventListener('click', () => {
    fetch('./backend/statis.php?action=nutrition&user_id=2')
      .then(response => response.json())
      .then(data => {
  
        const formattedData = formatNutritionData(data);
        renderSunburstChart(formattedData);
      })
      .catch(error => {
        console.error('Error fetching nutrition data:', error);
      });
  });
  
  const getUserBtn = document.getElementById('getUserData');
  
  getUserBtn.addEventListener("click", () => {
    const weight = parseFloat(document.getElementById("weightInput").value);
    
    if (isNaN(weight) || weight <= 0) {
        document.getElementById("result").innerText = "enter weight";
        return;
    }
  
    fetch('./backend/statis.php?action=user&user_id=2')
    .then(response => response.json())
    .then(data => {
  
      const userdata = data.user_data[0];
  
      const age = calculateAge(userdata.DATE_OF_BIRTH);
      const height = userdata.HEIGHT;
      const sportlevel = userdata.SPORT_VALUE;
  
      const{tdee,protein,carbs,fat}=calculateEnergy(age,height,weight,sportlevel)
     
    
  
      const nutritionData = data.nutrition_data;
      const actualConsumption = {
        Energy: 0,
        Protein: 0,
        Carbohydrates:0,
        Fats:0
      };
      
  
      nutritionData.forEach((nutrition, index) => {
        const averageDailyIntake = parseFloat(nutrition.average_daily_intake); 
        
        if (index == 1) { 
          actualConsumption['Energy'] += averageDailyIntake;
        } else if (index ==3) { 
          actualConsumption['Protein'] += averageDailyIntake;      
        } else if (index ==4 ||(index >= 6 && index < 13)) { 
          actualConsumption['Carbohydrates'] += averageDailyIntake;
        } else if (index == 5 ||(index >= 16 && index < 20)) {
          actualConsumption['Fats'] += averageDailyIntake;
      }
  
      for (let key in actualConsumption) {
        actualConsumption[key] = Math.floor(actualConsumption[key]);
      }
    
      });
  
  
     
  
      const  tableBody = document.getElementById('nutrition')
      const nutritiontable = [
        { name:"Energy (kcal)",suggestion: tdee, actual: actualConsumption.Energy },
        { name:"Protein (g)",suggestion: protein, actual: actualConsumption.Protein },
        { name:"Carbihydrates (g)",suggestion: carbs, actual: actualConsumption.Carbohydrates },
        { name:"Fats (g)",suggestion: fat, actual: actualConsumption.Fats }
      ];
      nutritiontable.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${item.name}</td><td>${item.suggestion}</td><td>${item.actual}</td>`;
        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
    });
  
  });
  
  });
  
  
  
  function calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  }
  
  function calculateEnergy(age,height,weight,sportlevel){
  
  
    let coef;
    const bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    switch (sportlevel) {
      case '0' :
        coef = 1.2;
        break;
      
      case '1':
        coef = 1.375;
        break;
      
      case '2':
        coef = 1.55;
        break;
  
      case '3':
        coef = 1.725;
        break;
  
      case '4':
        coef = 1.9;
        break;
    }
  
    const tdee = bmr*coef;
    const protein = (tdee * 0.20) / 4; 
    const carbs = (tdee * 0.55) / 4; 
    const fat = (tdee * 0.25) / 9; 
    return {
        tdee: Math.round(tdee),
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fat: Math.round(fat)
    };
  }
  
  
  
  
  function formatNutritionData(data) {
    const rootNode = {
      name: "root",
      children: []
    };
  
    const groupedData = {
      Water: [],
      Protein: [],
      Carbohydrates:[],
      Fiber:[],
      Alcohol:[],
      Fats:[],
      Mineral:[],
      Vitamin:[]
    };
  
    data.forEach((item, index) => {
      const { DICTIONARYNUTRITION, average_daily_intake } = item;
      
      if (index == 2) { 
        groupedData.Water.push({ name: DICTIONARYNUTRITION, value: average_daily_intake });
      } else if (index ==3) { 
        groupedData.Protein.push({ name: DICTIONARYNUTRITION, value: average_daily_intake });
      } else if (index ==4 ||(index >= 6 && index < 13)) { 
        groupedData.Carbohydrates.push({ name: DICTIONARYNUTRITION, value: average_daily_intake });
      } else if (index == 14) { 
        groupedData.Fiber.push({ name: DICTIONARYNUTRITION, value: average_daily_intake });
      } else if (index ==15) {
        groupedData.Alcohol.push({ name: DICTIONARYNUTRITION, value: average_daily_intake });
      } else if (index == 5 ||(index >= 16 && index < 20)) {
        groupedData.Fats.push({ name: DICTIONARYNUTRITION, value: average_daily_intake });
      } else if (index >= 20 && index < 32) {
        groupedData.Mineral.push({ name: DICTIONARYNUTRITION, value: average_daily_intake });
      } else if (index >= 32 && index <38){
        groupedData.Vitamin.push({ name: DICTIONARYNUTRITION, value: average_daily_intake });
      }
    });
  
  
    for (const [key, value] of Object.entries(groupedData)) {
      if (value.length > 0) {
  
        rootNode.children.push({
          name: key,
          children: value
        });
      }
    }
  
    return rootNode;
  }
  
  function renderSunburstChart(data){        
      const width = 928;
      const height = width;
      const radius = width / 6;
  
      // // 
      // const data = {
      //     name: "root",
      //     children: [
      //         {
      //             name: "sucre",
      //             children: [
      //                 { name: "sucre1", value: 100 },
      //                 { name: "sucre2", value: 200 }
      //             ]
      //         },
      //         {
      //             name: "vitamin",
      //             children: [
      //                 { name: "vitaminB1", value: 300 },
      //                 { name: "vitaminB2", value: 150 }
      //             ]
      //         }
      //     ]
      // };
  
      // 
  
      data.children.forEach(category => {
        category.children.forEach(item => {
            if (item.name.includes("mg")) {
                item.value = item.value / 1000; 
  
            } else if (item.name.includes("µg")) {
                item.value = item.value / 1000000; // 
            } 
        });
      });
    
      const svg = d3.select("#chart")
          .append("svg")
          .attr("viewBox", [-width / 2, -height / 2, width, width])
          .style("font", "10px sans-serif")
          .style("width", "100%")
          .style("height", "100%");
  
      // 
      const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));
  
      // 
      const hierarchy = d3.hierarchy(data)
          .sum(d => d.value)
          .sort((a, b) => b.value - a.value);
          
      const root = d3.partition()
          .size([2 * Math.PI, hierarchy.height + 1])
          (hierarchy);
      root.each(d => d.current = d);
  
      //
      const arc = d3.arc()
          .startAngle(d => d.x0)
          .endAngle(d => d.x1)
          .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
          .padRadius(radius * 1.5)
          .innerRadius(d => d.y0 * radius)
          .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));
  
      // 
      const path = svg.append("g")
          .selectAll("path")
          .data(root.descendants().slice(1))
          .join("path")
          .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
          .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
          .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
          .attr("d", d => arc(d.current));
  
      // 
      path.filter(d => d.children)
          .style("cursor", "pointer")
          .on("click", clicked);
  
      // 
      const format = d3.format(",d");
      path.append("title")
          .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);
  
      // 
      const label = svg.append("g")
          .attr("pointer-events", "none")
          .attr("text-anchor", "middle")
          .style("user-select", "none")
          .selectAll("text")
          .data(root.descendants().slice(1))
          .join("text")
          .attr("dy", "0.35em")
          .attr("fill-opacity", d => +labelVisible(d.current))
          .attr("transform", d => labelTransform(d.current))
          .style("font-size","14px")
      label
          .append("tspan")
          .attr("x", 0)
          .attr("dy", "0.35em")
          .text((d) => d.data.name);
            
      label
          .append("tspan")
          .attr("x", 0)
          .attr("dy", "1.1em")
          .text((d) => {
                const originalValue = d.data.value * (d.data.name.includes('mg') ? 1000 : (d.data.name.includes('µg') ? 1000000 : 1));
                return d.data.value > 0 ? `${originalValue}` : '';
          }); 
  
      // 
      const parent = svg.append("circle")
          .datum(root)
          .attr("r", radius)
          .attr("fill", "none")
          .attr("pointer-events", "all")
          .on("click", clicked);
  
      // 
      function clicked(event, p) {
          parent.datum(p.parent || root);
  
          root.each(d => d.target = {
              x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
              x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
              y0: Math.max(0, d.y0 - p.depth),
              y1: Math.max(0, d.y1 - p.depth)
          });
  
          const t = svg.transition().duration(750);
  
          path.transition(t)
              .tween("data", d => {
                  const i = d3.interpolate(d.current, d.target);
                  return t => d.current = i(t);
              })
              .filter(function(d) {
                  return +this.getAttribute("fill-opacity") || arcVisible(d.target);
              })
              .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
              .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
              .attrTween("d", d => () => arc(d.current));
  
          label.filter(function(d) {
              return +this.getAttribute("fill-opacity") || labelVisible(d.target);
          }).transition(t)
              .attr("fill-opacity", d => +labelVisible(d.target))
              .attrTween("transform", d => () => labelTransform(d.current));
      }
      
      function arcVisible(d) {
          return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
      }
  
      function labelVisible(d) {
          return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
      }
  
      function labelTransform(d) {
          const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
          const y = (d.y0 + d.y1) / 2 * radius;
          return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      }
  
      
  }