class MarkerDetectorLogic {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.threshold = document.createElement("input");
    this.threshold.type = "range";
    this.threshold.min = 4;
    this.threshold.max = 225;
    this.threshold.value = 25;
  }

  #averagePoints(points) {
    const center = { x: 0, y: 0 };
    points.forEach((point) => {
      center.x += point.x;
      center.y += point.y;
    });
    center.x /= points.length;
    center.y /= points.length;
    return center;
  }

  #distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  #angleBetweenPoints(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
  }

  #calculateClusterMetrics(group) {
    const size = Math.sqrt(group.length);
    const radius = size / 2;
    return { size, radius };
  }

  detect(imageData) {
    const points = [];

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const blueness = b - Math.max(r, g);

      if (blueness > parseInt(this.threshold.value)) {
        const pIndex = i / 4;
        const y = Math.floor(pIndex / imageData.width);
        const x = pIndex % imageData.width;
        points.push({ x, y, blueness });
      }
    }

    if (points.length < 2) {
      // Not enough points to detect markers
      return { leftMarker: null, rightMarker: null, tilt: 0, distance: 0 };
    }

    let centroid1 = points[0];
    let centroid2 = points[points.length - 1];

    let group1 = [];
    let group2 = [];

    for (let i = 1; i <= 10; i++) {
      group1 = points.filter(
        (p) => this.#distance(p, centroid1) < this.#distance(p, centroid2)
      );
      group2 = points.filter(
        (p) => this.#distance(p, centroid1) >= this.#distance(p, centroid2)
      );

      centroid1 = this.#averagePoints(group1);
      centroid2 = this.#averagePoints(group2);
    }

    const metrics1 = this.#calculateClusterMetrics(group1);
    const metrics2 = this.#calculateClusterMetrics(group2);

    const marker1 = {
      centroid: centroid1,
      points: group1,
      radius: metrics1.radius,
    };

    const marker2 = {
      centroid: centroid2,
      points: group2,
      radius: metrics2.radius,
    };

    const tilt = this.#angleBetweenPoints(marker1.centroid, marker2.centroid);
    const distance = this.#distance(marker1.centroid, marker2.centroid);

    return {
      leftMarker: centroid1.x < centroid2.x ? marker1 : marker2,
      rightMarker: centroid1.x < centroid2.x ? marker2 : marker1,
      tilt,
      distance,
    };
  }
}

export default MarkerDetectorLogic;
