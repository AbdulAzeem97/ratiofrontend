from flask import Flask, request, jsonify
from flask_cors import CORS
from ortools.sat.python import cp_model

app = Flask(__name__)
CORS(app)

@app.route('/optimize-plates', methods=['POST'])
def optimize_plates():
    data = request.get_json()
    tags = data['tags']
    ups_per_plate = data['upsPerPlate']
    plate_count = data['plateCount']

    # Step 1: Greedy Initialization
    greedy_solution = greedy_initialize(tags, ups_per_plate, plate_count)

    # Step 2: Pass Greedy Seed into Solver
    result = solve_plate_optimization(tags, ups_per_plate, plate_count, greedy_solution)
    
    return jsonify(result)

@app.route("/", methods=["GET"])
def hello():
    return "Backend is up and running!"

class PlateOptimizationCallback(cp_model.CpSolverSolutionCallback):
    def __init__(self, tag_to_plate, ups_vars, plate_sheets, tags, plate_count, ups_per_plate, verbose=False):
        super().__init__()
        self.best_solution = None
        self.best_obj = float('inf')
        self.tag_to_plate = tag_to_plate
        self.ups_vars = ups_vars
        self.plate_sheets = plate_sheets
        self.tags = tags
        self.plate_count = plate_count
        self.ups_per_plate = ups_per_plate
        self.verbose = verbose
        self.solution_count = 0

    def on_solution_callback(self):
        self.solution_count += 1
        obj = sum(self.Value(s) for s in self.plate_sheets)

        if obj < self.best_obj:
            self.best_obj = obj
            results = []
            totalProduced = 0
            totalItems = sum(tag['QTY'] for tag in self.tags)

            for j in range(self.plate_count):
                for i in range(len(self.tags)):
                    if self.Value(self.tag_to_plate[i]) == j:
                        ups = self.Value(self.ups_vars[i])
                        sheets = self.Value(self.plate_sheets[j])
                        produced = ups * sheets
                        
                        result_item = {
                            "COLOR": self.tags[i]["COLOR"],
                            "SIZE": self.tags[i]["SIZE"],
                            "QTY": self.tags[i]["QTY"],
                            "PLATE": chr(65 + j),
                            "OPTIMAL_UPS": ups,
                            "SHEETS_NEEDED": sheets,
                            "QTY_PRODUCED": produced,
                            "EXCESS": produced - self.tags[i]["QTY"]
                        }
                        
                        # Add optional fields if they exist
                        for field in ["ITEM_DESCRIPTION", "ITEM_CODE", "PRICE", "RATIO", "RUN", "SHEET"]:
                            if field in self.tags[i]:
                                result_item[field] = self.tags[i][field]
                        
                        results.append(result_item)
                        totalProduced += produced

            totalSheets = sum(self.Value(s) for s in self.plate_sheets)
            totalExcess = totalProduced - totalItems
            waste = round((totalExcess / totalProduced) * 100, 2) if totalProduced else 0.0

            self.best_solution = {
                "results": results,
                "summary": {
                    "totalSheets": totalSheets,
                    "totalProduced": totalProduced,
                    "totalExcess": totalExcess,
                    "wastePercentage": waste,
                    "totalPlates": self.plate_count,
                    "totalItems": totalItems,
                    "upsCapacity": self.ups_per_plate,
                }
            }

            if self.verbose:
                print(f"\n🟢 New Best Solution Found!")
                print(f"   ➤ Total Sheets: {totalSheets}")
                print(f"   ➤ Waste %     : {waste}%")
                print(f"   ➤ Excess Qty  : {totalExcess}")
                print(f"   ➤ Produced    : {totalProduced}")
                print(f"   ➤ Solution #{self.solution_count}\n")

def greedy_initialize(tags, ups_per_plate, plate_count):
    sorted_tags = sorted(tags, key=lambda t: t['QTY'], reverse=True)
    initial_assignment = []
    plate_index = 0
    used_ups = [0] * plate_count

    for tag in sorted_tags:
        best_ups = max(1, min(ups_per_plate, tag['QTY'] // 1000))
        assigned = False
        for p in range(plate_count):
            if used_ups[p] + best_ups <= ups_per_plate:
                initial_assignment.append((tag, p, best_ups))
                used_ups[p] += best_ups
                assigned = True
                break
        if not assigned:
            initial_assignment.append((tag, plate_index % plate_count, best_ups))
            used_ups[plate_index % plate_count] += best_ups
            plate_index += 1

    return initial_assignment

def solve_plate_optimization(tags, ups_per_plate, plate_count, seed_solution, verbose=False):
    model = cp_model.CpModel()
    num_tags = len(tags)
    all_plates = range(plate_count)

    tag_to_plate = [model.NewIntVar(0, plate_count - 1, f'tag_{i}_plate') for i in range(num_tags)]
    ups_vars = [model.NewIntVar(1, ups_per_plate, f'ups_{i}') for i in range(num_tags)]
    plate_sheets = [model.NewIntVar(1, 10000, f'plate_sheet_{j}') for j in all_plates]
    
    # Apply greedy hints if available
    if seed_solution:
        for i, (tag, plate_index, ups) in enumerate(seed_solution):
            model.AddHint(tag_to_plate[i], plate_index)
            model.AddHint(ups_vars[i], ups)

    for j in all_plates:
        for i in range(num_tags):
            is_on_plate = model.NewBoolVar(f'is_tag_{i}on_plate{j}')
            model.Add(tag_to_plate[i] == j).OnlyEnforceIf(is_on_plate)
            model.Add(tag_to_plate[i] != j).OnlyEnforceIf(is_on_plate.Not())

            product_var = model.NewIntVar(1, 1000000, f'prod_tag_{i}plate{j}')
            model.AddMultiplicationEquality(product_var, [plate_sheets[j], ups_vars[i]])
            model.Add(product_var >= tags[i]['QTY']).OnlyEnforceIf(is_on_plate)

    for j in all_plates:
        ups_sum = []
        for i in range(num_tags):
            is_on_plate = model.NewBoolVar(f'sum_tag_{i}on_plate{j}')
            model.Add(tag_to_plate[i] == j).OnlyEnforceIf(is_on_plate)
            model.Add(tag_to_plate[i] != j).OnlyEnforceIf(is_on_plate.Not())
            term = model.NewIntVar(0, ups_per_plate, f'active_ups_{i}_{j}')
            model.AddMultiplicationEquality(term, [ups_vars[i], is_on_plate])
            ups_sum.append(term)
        model.Add(sum(ups_sum) <= ups_per_plate)

    model.Minimize(sum(plate_sheets))

    solver = cp_model.CpSolver()
    
    solver.parameters.max_time_in_seconds = 500
    solver.parameters.random_seed = 42
    solver.parameters.num_search_workers = 8

    cb = PlateOptimizationCallback(tag_to_plate, ups_vars, plate_sheets, tags, plate_count, ups_per_plate, verbose=verbose)
    status = solver.SolveWithSolutionCallback(model, cb)

    print(f"Solver status: {solver.StatusName(status)}")
    print(f"Total solutions tried: {cb.solution_count}")
    print(f"Wall time: {solver.WallTime():.2f}s")
    print(f"Best objective bound: {solver.BestObjectiveBound()}")
    print(f"Best found objective: {cb.best_obj}")

    if cb.best_solution:
        return cb.best_solution

    print("⚠ No solution was found!")
    return {"error": "No solution found"}

if __name__ == '__main__':
    print("🚀 Starting UPS Optimizer Backend...")
    app.run(host='0.0.0.0', port=5000, debug=True)