export default function() {
  this.route("projects", function() {
    this.route("actions", function() {
      this.route("show", { path: "/:id" });
    });
  });
};
