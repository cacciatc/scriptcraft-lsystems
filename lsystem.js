/*
 lsystem.js - An L-system library
 [The "BSD licence"]
 Copyright (c) 2008, John Snyders
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
 3. The name of the author may not be used to endorse or promote products
    derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
load(__folder + "drone.js");
/**
 * @fileoverview
 *
 * <p>L-system library</p>
 * <p>For background information see <a href="http://en.wikipedia.org/wiki/L-system">this</a>
 * and "The Algorithmic Beauty of Plants" available 
 * <a href="http://algorithmicbotany.org/papers/#abop">here</a></p>
 *
 * <p>An L-system is a production system that repeatedly rewrites symbols according to
 * a set of rules. It is used to draw or model organic systems and fractals. 
 * An L-system takes an initial list of symbols and iteratively produces a new list of
 * symbols based on a set of production rules. It can also operate on lists with 
 * structure - lists of lists. These are called branching or tree L-systems.</p>
 *
 * <p>L-systems come in a few different varieties and each is supported by this library. 
 * They can be:</p>
 * <ul>
 * <li>parametric or non-parametric,</li>
 * <li>deterministic or non-deterministic,</li>
 * <li>context-free or context-sensitive,</li>
 * <li>branching (tree) or non-branching (flat)</li>
 * </ul>
 * <p>Each L-system is a combination of one of each of the four options above.
 * For example non-parametric, context-sensitive, non-deterministic, and branching.</p>
 *
 * <p>A parametric L-system has parameters, (also called arguments) associated with the
 * symbols and a non-parametric one does not. The symbol plus its parameters is called a module.
 * Typically parametric L-systems restrict the parameters to be numbers. This
 * library allows parameters to be any JavaScript type.</p>
 *
 * <p>A deterministic L-system will have at most one rule that can match a given input module (symbol).
 * A non-deterministic L-system can have more than one rule that matches and a particular rule
 * is selected randomly based on probabilities assigned to each matching rule.</p>
 *
 * <p>A context-free L-system matches a single input module. A context-sensitive L-system matches
 * based on an input module and its neighbors.</p>
 *
 * <p>A branching L-system has structure in its list. Each item in the list may be itself a list.
 * A non-branching L-system has a flat list. It seems that this is usually implemented by introducing
 * structural symbols [ and ] but the list remains flat. This library uses a nested list for the 
 * branch. Strictly speaking the tree structure implementation is only useful for context-sensitive 
 * matching.</p>
 *
 * <p>An L-system consists of:</p>
 * <ul>
 * <li>a set of symbols denoted V (traditionally the symbols are single characters such as A or + but
 * extended here to any unique identifying string). For the L-system to do something useful the symbols 
 * need to have some kind of semantics or behavior. Here the behavior is given by a function associated
 * with each symbol. A symbol can have zero or one functions associated with it. Think of this function
 * along with the symbol name as the definition of the symbol. The functions can take arguments. The
 * symbols processed by the L-system can have any number of arguments associated with them. 
 * The symbol along with its arguments is called a module. Think of the module as an instance of a symbol.
 *
 * <p>Note: The terms symbol and module are often used interchangeably. The only difference is that a module
 * includes any arguments that go with the symbol. In non-parametric L-systems they are truly the same.</p>
 * </li>
 * <li>an initial (starting) non empty list of modules. Each module consists of a symbol from the above 
 * set V and zero or more actual arguments. This initial list is the axiom and is denoted w.</li>
 *
 * <li>a current list of modules (the current generation) which the L-system is working on. Each 
 * iteration (generation) the L-system reads the current list and replaces it with a new list as 
 * determined by a set of production rules. The current list is initialized with the axiom.
 *
 * <p>Note: Often the term string is used rather than list. This comes from a simple implementation where
 * the single character symbols are stored in a string. This library uses arrays to implement the 
 * lists of modules. This allows easier processing of modules that have parameters or if the symbol is
 * more than one character. It also makes it easier and more efficient to deal with tree structures.</p>
 * </li>
 * <li>a set of production rules denoted P. The production rules define how the current list of symbols 
 * starting with the axiom is turned into the next list of symbols. The matching production rules are
 * applied to each symbol in the current list. A rule consist of:
 * <ul>
 *   <li>a predecessor that matches one or more modules in the current generation. A context free L-system
 *   has a single predecessor. A context sensitive L-system matches the current module in the current 
 *   generation as well as its neighbors. A predecessor has to have the same symbol and same number
 *   of arguments to match.</li>
 *
 *   <li>an optional condition which determines if the rule fires, The condition is a Boolean function
 *   which can use any of the arguments in the predecessor. The value of the arguments comes from the
 *   actual arguments in the module matched.</li>
 *
 *   <li>one or more successors. A successor specifies what set of modules will be added to the next
 *   generation when the predecessor is matched in the current generation. 
 *   If there is one successor for each rule then the L-system is deterministic.
 *   If there is more than one then it is stochastic or non-deterministic and a specific 
 *   successor is chosen randomly according to its probability. 
 *   The successor consists of a probability and a function that returns a list of modules. 
 *   The function can set the actual arguments in each module using arbitrary expressions involving the
 *   actual arguments from the predecessor. The probability is used to determine the chance of this 
 *   successor being used. The probabilities must sum to 1.</li>
 *
 * <p>Note: It is possible that more than one rule will match a given input module. This is more common
 * for parametric L-systems where the condition would apply in one case and not another. The first
 * rule that matches is always used. The only way to get stochastic behavior is to specify multiple
 * successors in a single rule.</p>
 * </ul>
 * </li>
 * <li>A set of skip symbols. These are symbols to ignore while matching context predecessors.</li>
 * </ul>
 * <p>In some descriptions of L-systems a distinction is made between terminal (constant) and 
 * non-terminal (variable) symbols.  No such distinction is made here. If you want a symbol to be a
 * constant then don't use it on the left hand side of a production rule.</p>
 *
 * <h2>General Processing:</h2>
 *
 * <p>There are two phases in working with an L-system: generation and rendering.</p>
 * 
 * <p>Generation is the process of turning the initial or current generation into the next generation.</p>
 * 
 * <p>Rendering is also known as interpretation. Rendering applies some meaning to the list of 
 * modules in the current generation and generates some kind of output. Typically the output 
 * is in the form of a visual interpretation of the module list. Rendering is up to you. 
 * You provide a function for each symbol that you want to render. That function is given the
 * arguments of the module if the system is parametric and the module has arguments.</p>
 *
 * <p>The current generation is also called the input list and the next generation is called the
 * output list. This is from the point of view of the production system.</p>
 * <p>The generation phase works like this:</p>
 * <pre>
 *   for each module in the current generation
 *     find the first rule that matches
 *     if (a match is found)
 *       invoke the successor function and append the resulting list to the next generation
 *     else
 *       when no rule matches the module from the current generation is copied to the next generation</pre>
 *
 * <p>There are two reserved symbols that are always used for a specific purpose. They are
 * [ and ]. Open square bracket ([) begins a branch point. The close square bracket (]) ends a branch level.</p>
 *
 * @name lsystem
 * @author John Snyders
 * @license BSD
 * @version 0.1
 */

/**
 * <p>Object Lsystem implements an L-system production system.</p>
 *
 * <h2>Example:</h2>
 * <p>This shows how to translate a traditional symbolic expression of an L-system into
 * the JavaScript of this library.</p>
 * <pre> 
 * Fr
 * Fl --&gt; Fr + Fl + Fr
 * Fr --&gt; Fl - Fr - Fl</pre>
 * <p>becomes</p>
 * <pre>
 * var ls = new jjs.Lsystem(
 *    { // define the symbols and what they do
 *      Fl: function() { t.forward(d); },
 *      Fr: function() { t.forward(d); },
 *      "+": function() { t.left(60); },
 *      "-": function() { t.right(60); }
 *    }, // the axiom
 *    [ {id: "Fr"} ],
 *    [  // the rules
 *      { p: [ {id: "Fl"} ],
 *        s: function() { return [{id:"Fr"},{id:"+"},{id:"Fl"},{id:"+"},{id:"Fr"}];} },
 *      { p: [ {id: "Fr"} ], 
 *        s: function() { return [{id:"Fl"},{id:"-"},{id:"Fr"},{id:"-"},{id:"Fl"}];} }
 *    ]
 * );</pre>
 *
 * <p>This assumes a object <code>t</code> in scope that implements turtle graphic functionality and a variable
 * <code>d</codde> that provides a distance to move forward.</p>
 *
 * @param vars - defines the set of symbols (V) and their behaviors. If a symbol has no behavior then
 * it can be omitted from vars or the function can do nothing. This is an object where the 
 * symbol names are the object properties and the value of each property is a function that 
 * is called during rendering with the actual arguments of the module. The function's this
 * variable is the Lsystem object. 
 * <p>Example: { "<i>symbol-id</i>": function (<i>args</i>) { <i>behavior</i> },... }</p>
 * 
 * <p>It is possible but not very useful for vars to be an object with no properties. You might
 * do this if some other program consumed the current generation list directly.</p>
 *
 * @param start - an array of modules that will be used for the initial generation. A module is
 * an object with properties "id" and "args". Id is the symbol and args is an array of
 * arguments. If there are no arguments then the args property can be omitted.
 * <p>Example: [ { id: "<i>symbol-id</i>", args: [<i>arg-values</i>] },... ]</p>
 *
 * @param rules - a list of rules. Each rule contains a predecessor match pattern p and one or more
 * successors functions which return the modules for the next generation.
 * <p>Example: [ <i>rule</i>,... ]<p>
 * <p>A rule is a predecessor list, an optional condition and a list of successors
 * as follows:</p>
 * <pre>Example:
 *   { p: [ { dir: <i>direction</i>, id: "<i>symbol-id</i>", a: <i>number-of-args</i> },... ],
 *     condition: function(<i>args</i>) { <i>return-boolean-expression</i> },
 *     s: [ {p: <i>probability</i> f: function(<i>args</i>) { <i>return-modules-array</i> } },...]
 *   }</pre>
 *   <p>The first predecessor matches the current module. It is the strict predecessor.
 *   The direction must be omitted on the first predecessor and must be present on
 *   all the others. The direction is the axis along which to match the symbol. It can 
 *   be one of:</p>
 *   <ul>
 *   <li>"^" previous sibling or parent</li>
 *   <li>"&lt;" previous sibling</li>
 *   <li>"&gt;" following sibling</li>
 *   <li>"]" parent</li>
 *   <li>"[" child</li>
 *   </ul>
 *   <p>Any one of the directions can be preceeded with "." to return the starting context
 *   to the current module.</p>
 *   <p>Example: {id:"Q"},{dir:"&lt;", id:"X"},{dir:".&gt;",id:"Y"} will match symbol Q with a 
 *   preceding sibling X and a following sibling Y. After the X is matched the current matching
 *   position is at the X so the "." prefix is used to set the context back to the Q before
 *   looking for the following sibling.</p>
 *   <p>Note: in descriptions I have seen there are just two directions that can be matched
 *   preceeding (&lt;) and following (&gt;). I choose to get a little more specific. So in examples
 *   where you see < used you should translate that to ^. Also make sure that the strict predecessor
 *   comes first.</p>
 *   <p>id is the symbol to match and a is the arity of the module (number of arguments).
 *   A predecessor matches when the ids are equal and the number of arguments (a) matches
 *   the number of actual arguments in the module. Example: predecessor { id: "X", a: 3 } 
 *   matches module { id: "X", args: [1, "seven", {x: 2, y:3}] } because the symbol X
 *   is the same and the module has 3 arguments.</p>
 *   <p>If there is a single predecessor then the array can be omitted.
 *   Ex: p: {id: "A", a: 1}</p>
 *
 *   <p>The condition is optional. If present it is a Boolean function
 *   which can use any of the arguments in the predecessor. Arguments are passed to this function
 *   in the same order as the predecessors that they come from. For example: If there are two predecessors,
 *   and the first one has 2 arguments and the second one has 1 argument and the condition takes arguments 
 *   X, Y, Z then X gets the value of the first argument of the first predecessor, Y gets the second 
 *   argument of the first predecessor and Z gets the argument of the second predecessor. 
 *   The <code>this<code> reference in the condition function is the Lsystem object.</p>
 *   
 *   <p>The successor defines the modules that go into the next generation. The function f
 *   must return an array of modules. The function can take arguments from the predecessor modules in
 *   the same way as the condition function. The <code>this</code> reference in function f is the 
 *   Lsystem object. Example: function() { return [ {id:"b"},{id:"c"} ];}.</p>
 *   For a branching L-system there are two choices. The reserved symbols [ and ] can be used as
 *   symbols (Ex: return [ {id:"+"},{id:"["},{id:"f"},{id:"]"}];) or you can use nested arrays
 *   (Ex: return [ {id:"+"},[{id:"f"}] ]). The only functional difference is that the first (flat)
 *   option can only use the < and > directions when doing context sensitive matches. You can effectively 
 *   delete a symbol by returning an empty array.</p>
 *   <p>If there is more than one successor then the probability p is used to select one.</p>
 *   <p>If there is a single successor then the probability and array can be omitted.
 *   Ex: s: function() {...}</p>
 *
 * <p>The rules for each strict predecessor will be evaluated in ranked order. Having a condition
 * is worth a 1000 points and there is one point for each predecessor. The rules are matched from
 * highest to lowest. The first match found is used.</p>
 *
 * @param ignore - a map of symbols that should be ignored when context matching. this
 * is optional and can be omitted for a context free L-system. The keys are symbols
 * and the values are not important.
 * <p>Example { X: "", Y: "" }</p> 
 *
 * @constructor
 */
function Lsystem(vars, start, rules, ignore)
{
  this.vars = vars;
  this.start = start;
  this.setRules(rules);
  this.ignore = ignore;
  /**
   * Array of modules. The current generation.
   */
  this.curgen = start;
  /**
   * Number of modules in the current generation. This includes all modules in a tree.
   */
  this.moduleCount = 0;
  /*
   * The generation number. Starts at zero and increments each time a new generation
   * is calculated with generate (or generateBegin/generateNext)
   */
  this.generation = 0;
  /* implementation */
  this.reset();
  this.renderIterator = null;
  this.generateIterator = null;
  this.nextgen = null;
  this.stack = null;
}

Lsystem.prototype = {

  /**
   * Render the whole current generation. If rendering is going to take a long time
   * then consider using renderBegin, renderHasNext, renderNext[N] methods. 
   */
  render: function() 
  {
    // for each module in the current generation
    this.renderBegin();
    while (this.renderHasNext())
    {
      this.renderNext();
    }
  },

  /**
   * Begin the render process. Call before renderHasNext, renderNext[N].
   */
  renderBegin: function()
  {
    this.renderIterator = new TreeIterator(this.curgen);
  },

  /**
   * Determine if there are more modules in the current generation to render.
   * @returns true if there are more modules to render.
   * @type boolean
   */
  renderHasNext: function()
  {
    return this.renderIterator.hasNext();
  },

  /**
   * Render the next module in the current generation.
   */
  renderNext: function()
  {
      // call the render function if there is one
      var m = this.renderIterator.next();
      if (m === '[' || m === ']')
      {
        m = { id: m };
      }
      var f = this.vars[m.id];
      if (f && typeof f == "function")
      {
        f.apply(this, m.args ? m.args : [this.dr]);
      }
  },

  /**
   * Render the next N modules in the current generation.
   * @param n the number of modules to render. May be more than the actual number of 
   * modules left in the list.
   * @returns the number of modules actually rendered.
   */
  renderNextN: function(n)
  {
    var i = 0;
    while (i < n && this.renderHasNext())
    {
      this.renderNext();
      i++;
    }
    return i;
  },

  /**
   * Return the Lsystem to the initial state by assigning the start list to the 
   * current generation (curgen). The generation count is reset to zero.
   */
  reset: function()
  {
    this.curgen = this.start;
    this.generation = 0;
    this.moduleCount = countTreeNodes(this.curgen, 0);
  },

  /**
   * Produce the next N generations. Use this method when you don't care about 
   * rendering the intermediate generations. If this could take a long time you
   * may want to consider using generateBegin/generateNext.
   * @param n the number of generations to produce.
   */
  generateN: function(n)
  {
    for(var i = 0; i < n; i++)
    {
      this.generate();
    }
  },

  /**
   * Produce the next generation. This could take a long time.
   */
  generate: function()
  {
    // for each module in the current generation
    this.generateBegin();
    while (this.generateHasNext())
    {
      this.generateNext();
    }
  },

  /**
   * Begin the generate process. Call before generateHasNext, generateNext[N].
   */
  generateBegin: function()
  {
    this.generateIterator = new TreeIterator(this.curgen, this.ignore);
    this.nextgen = [];
    this.moduleCount = 0;
    this.stack = [ this.nextgen ];
  },
  
  /**
   * Return true when there are more modules to generate.
   * @return true if more modules
   * @type boolean
   */
  generateHasNext: function()
  {
  	return this.generateIterator.hasNext();
  },

  /**
   * Generate the next generation output for the next module in this current generation.
   */
  generateNext: function()
  {
    var module = this.generateIterator.next();
    if (module === '[')
    {
      this.stack.push([]);
      this.moduleCount++;
    }
    else if (module === ']')
    {
      var top = this.stack.pop();
      this.stack[this.stack.length-1].push(top);
      this.moduleCount++;
    }
    else if (module.id !== '!') // ! never gets copied or matched
    {
      var successors = this.getSuccessors(module, this.generateIterator);
      if (successors !== null)
      {
        // add the modules to the next generation
        for (var j = 0; j < successors.length; j++)
        {
          this.stack[this.stack.length-1].push(successors[j]);
          if (isArray(successors[j]))
          {
            this.moduleCount += countTreeNodes(successors[j], 0) + 2;
          }
          else
          {
            this.moduleCount++;
          }
        }
      }
      else
      {
        // if no rules match then just copy module to next generation
        this.stack[this.stack.length-1].push(module);
        this.moduleCount++;
      }
    }
    // check if done
    if (!this.generateIterator.hasNext())
    {
      this.curgen = this.nextgen;
      this.generation++;
    }
  },

  /**
   * Generate output for the next n modules. If there are fewer than n modules remaining
   * to process then it stops early.
   * @param n the number of modules to process. May be more than the actual number of 
   * modules left in the current generation.
   * @return number of modules processed.
   */
  generateNextN: function(n)
  {
    var i = 0;
    while (i < n && this.generateHasNext())
    {
      this.generateNext();
      i++;
    }
    return i;
  },

  /**
   * Set the rules. Usually the rules are set in the constructor but this can
   * be used to change the rules after the fact.
   */
  setRules: function(rules)
  {
    var ruleMap = {};
    // for each rule
    for (var r = 0; r < rules.length; r++)
    {
      var rule = rules[r];
      // put the rules in normal form

      // first the predecsssor
      if (typeof rule.p == "object" && !isArray(rule.p))
      {
        rule.p = [ rule.p ];
      }

      for (var i = 0; i < rule.p.length; i++)
      {
        var p = rule.p[i];
        if (i === 0 && p.dir)
        {
          throw "Strict predecessor must not specify a direction.";
        }
        else if (i > 0 && !p.dir)
        {
          throw "Context predecessor must specify a direction.";
        }
        if (!p.a)
        {
          p.a = 0;
        }
        if (i === 0)
        {
          var key = p.id + p.a;
          if (!ruleMap[key])
          {
            ruleMap[key] = [];
          }
          ruleMap[key].push(rule);
        }
      }
      // next the successor
      if (typeof rule.s == "function")
      {
        rule.s = [ {p: 1, f: rule.s} ];
      }
      else
      {
        var s = rule.s;
        var sum = 0;
        // check probabilities
        for (var j = 0; j < s.length; j++)
        {
          sum += s[j].p;
        }
        if (sum != 1.0)
        {
          throw "Probabilities must sum to 1.";
        }
        // change probabilities to sum of probability and previous probabilities.
        sum = 0;
        for (j = 0; j < s.length; j++)
        {
          sum += s[j].p;
          s[j].p = sum;
        }
      }
      this.rules = rules;
      this.ruleMap = ruleMap;
    }
    // order rules from most specific to least. 
    // conditions have the ability to be most specific 
    // then the more predecessors to match the more specific.
    for (var rm in this.ruleMap) if (this.ruleMap.hasOwnProperty(rm))
    {
      this.ruleMap[rm].sort(function (r1, r2) {
        function rank(r) {
          var i = r.p.length;
          if (r.condition)
          {
            i += 1000;
          }
          return i;
        }
        return rank(r2) - rank(r1);
      });
    }
  },

  /**
   * Return a string representation of the current generation
   */
  curgenToString: function(sep, indent, wrap)
  {
    var curIndent = "";
    var it = new TreeIterator(this.curgen);
    var i = 0; // keep track of commas, and new lines
    var dedent = false;
    var out = "[";
    while (it.hasNext())
    {
      var module = it.next();
      if (module === '[' || module === ']')
      {
        module = { id: module };
      }
      if (indent)
      {
        if (module.id == "[")
        {
          if (i > 0)
          {
            out += sep;
          }
          curIndent += indent;
          out += "\r\n" + curIndent;
          i = 0;
        }
        if (module.id == "]")
        {
          curIndent = curIndent.substring(0, curIndent.length - indent.length);
        }
      }
      if (wrap && i > wrap)
      {
        out += sep + "\r\n" + curIndent;
        i = 0;
      }
      if (i > 0 && module.id != ']')
      {
        out += sep;
      }
      if (dedent)
      {
        out += "\r\n" + curIndent;
        dedent = false;
      }

      out += module.id;

      if (module.args && module.args.length > 0)
      {
        out += "(";
        for (var j = 0; j < module.args.length; j++)
        {
          if (j > 0)
          {
            out += ", ";
          }
          out += this.valueToString(module.args[j]);
        }
        out += ")";
      }
      if (module.id == "[")
      {
        i = 0;
      }
      else
      {
        i++;
      }
      if (indent && module.id == "]")
      {
        dedent = true;
      }
    }

    out += "]";
    return out;
  },

  toString: function(indent, sep, wrap)
  {
    return this.curgenToString(", ");
  },

  /*
  ** Implementation
  */
  
  valueToString: function(val)
  {
    var out = "";
    var prop;
    var i;
    if (isArray(val))
    {
      out += "[";
      for (i = 0; i < val.length; i++)
      {
        if (i > 0)
        {
          out += ", ";
        }
        out += this.valueToString(val[i]);
      }
      out += "]";
    }
    else if (typeof val === 'object')
    {
      out += "{";
      i = 0;
      for (prop in val) if (val.hasOwnProperty(prop))
      {
        if (i > 0)
        {
          out += ", ";
        }
        out += prop + ": ";
        out += this.valueToString(val[prop]);
        i++;
      }
      out += "}";
    }
    else
    {
      out += val;
    }
    return out;
  },

  getSuccessors: function(module, it)
  {
    // Look up possible matching rules by module
    var moduleArgsLen = module.args ? module.args.length : 0;
    var key = module.id + moduleArgsLen;
    var rules = this.ruleMap[key];
    if (!rules)
    {
      return null;
    }
    // for now linear search and use first found
    for (var i = 0; i < rules.length; i++)
    {
      var rule = rules[i];
      var args = this.matchRule(rule, module, it);
      if (args !== null)
      {
        // a match was found
        // fire the production rule to get a new list of modules to substitute
        if (rule.s.length == 1)
        {
          return rule.s[0].f.apply(this, args);
        }
        // if more than one choose according to probabilities
        var choice = Math.random();
        for (var j = 0; j < rule.s.length; j++)
        {
          if (choice < rule.s[j].p)
          {
            return rule.s[j].f.apply(this, args);
          }
        }
        throw "Internal error. Probabilities don't make sense.";
      }
    }
    return null;
  },

  /*
   Attempt to match a rule with a particular module at position it

   Return an array of argument values if there is a match and null if there is no match
   the argument array may be empty if there are no arguments in any of the predecessors
  */
  matchRule: function(rule, module, it)
  {
    var ruleArgs = [];
    var curModule = module;
    it.resetContext();

    // for each predecessor
    for (var i = 0; i < rule.p.length; i++)
    {
      var p = rule.p[i];
      // the first rule matches with the strict predecessor (module)
      if (i > 0)
      {
        // after that the direction determines the context module to match
        var dir = p.dir;
        if (dir[0] == ".")
        {
          it.resetContext();
          dir = dir[1];
        }
        switch (dir[0])
        {
        case "^":
          curModule = it.previousSiblingOrParent();
          break;
        case "<":
          curModule = it.previousSibling();
          break;
        case ">":
          curModule = it.nextSibling();
          break;
        case "[":
          curModule = it.child();
          break;
        case "]":
          curModule = it.parent();
          break;
        default:
          throw "Invalid direction '" + dir + "'";
        }
        if (!curModule)
        {
          return null; // no match
        }
      }
      if (this.matchModule(p, curModule))
      {
        // if there are any args
        if (curModule.args)
        {
          // update ruleArgs with actual arg values from module
          for (var j = 0; j < curModule.args.length; j++)
          {
            // add actual arg value
            ruleArgs.push(curModule.args[j]);
          }
        }
      }
      else
      {
        return null; // no match
      }
    }
    // all the predecessors matched and all arg values have been gathered
    // now evaluate the condition if there is one
    if (rule.condition)
    {
      if (!rule.condition.apply(this, ruleArgs))
      {
        return null; // no match 
      }
    }
    return ruleArgs;
  },

  /*
   Match a single predecessor item (match) in a rule with a single module.
   A predecessor matches a module if the ids are the same and the number
   of arguments matches the actual number of arguments in the module. 

   match - the rule predecessor item to match
   module - the module to match with

   Return true if they match false otherwise. 
  */
  matchModule: function(match, module)
  {
    if (match.id == module.id)
    {
      var matchArgsLen = match.a ? match.a : 0;
      var moduleArgsLen = module.args ? module.args.length : 0;
      if (matchArgsLen == moduleArgsLen)
      {
        return true;
      }
    }
    return false;
  }

};

// utility functions
function isArray(a)
{
  return typeof a === 'object' && a.constructor === Array;
}

function countTreeNodes(t, c)
{
  for (var i = 0; i < t.length; i++)
  {
    if (isArray(t[i]))
    {
      // the brackets count too
      c += countTreeNodes(t[i], c) + 2;
    }
    else
    {
      c++;
    }
  }
  return c;
}

/* 
 Used internally by Lsystem for traversing a potentially 
 recursive module list.
 Has 2 functions.
 1) iterate over the tree
     methods: hasNext and next
 2) at any point (context) in the iteration of the tree allow finding nodes from the current context
     all the other public methods
 @constructor
 @private
*/
function TreeIterator(tree, ignore) 
{
  this.stack = [{ i: 0, ci: -1, a: tree }];
    // i is current iteration position in a
    // ci is current context position in a
  this.depth = 1; // track depth for iterating because stack may get changed during context operations
  this.clevel = 0; // current context level
  this.ignore = ignore || { };
}

TreeIterator.prototype = {
  hasNext: function()
  {
    return !this.empty();
  },

  next: function()
  {
    var m;
    if (!this.empty())
    {
      var top = this.peek();
      if (top.i < top.a.length)
      {
        m = top.a[top.i];
        top.ci = top.i;
        top.i++;
        if (isArray(m))
        {
          this.push(m);
          return "[";
        }
        return m;
      }
      this.pop();
      return "]";
    }
    throw "No next.";
  },

  resetContext: function ()
  {
    var level;
    while (this.stack.length > this.depth)
    {
      this.clevel--;
      this.stack.pop();
    }
    if (this.clevel < 0)
    {
      this.clevel = 0;
    }
    level = this.stack[this.clevel];
    for (var l = this.clevel; l < this.stack.length; l++)
    {
      level = this.stack[l];
      level.ci = level.i - 1;
    }
    this.clevel = this.stack.length - 1;
  },

  previousSiblingOrParent: function ()
  {
    var level;
    var m;

    while (this.clevel >= 0)
    {
      level = this.stack[this.clevel];
      for (level.ci--; level.ci >= 0; level.ci--)
      {
        m = level.a[level.ci];
        if (!this.skip(m))
        {
          return m;
        }
      }
      this.clevel--;
    }
    return null;
  },

  previousSibling: function ()
  {
    var level;
    var m;
    if (this.clevel < 0)
    {
      return null;
    }
    level = this.stack[this.clevel];

    for (level.ci--; level.ci >= 0; level.ci--)
    {
      m = level.a[level.ci];
      if (!this.skip(m))
      {
        return m;
      }
    }
    return null;
  },

  nextSibling: function()
  {
    var level;
    var m;
    if (this.clevel < 0)
    {
      return null;
    }
    level = this.stack[this.clevel];

    for (level.ci++; level.ci < level.a.length; level.ci++)
    {
        m = level.a[level.ci];
        if (!this.skip(m))
        {
          return m;
        }
    }
    return null;
  },

  parent: function()
  {
    var level;
    var m;
    var atLeastOneArray = false;

    while (this.clevel >= 0)
    {
      level = this.stack[this.clevel];
      for (level.ci--; level.ci >= 0; level.ci--)
      {
        m = level.a[level.ci];
        if (isArray(m))
        {
          atLeastOneArray = true;
        }
        else
        {
          if (atLeastOneArray)
          {
            return m;
          }
          return null;
        }
      }
      atLeastOneArray = true;
      this.clevel--;
    }
    return null;
  },

  // p is predicate function that takes a module as input and returns true if it is a matching child
  findChild: function(p)
  {
    var level;
    var m;
    var atLeastOneArray = false;

    if (this.clevel < 0)
    {
      return null;
    }
    level = this.stack[this.clevel];

    for (level.ci++; level.ci < level.a.length; level.ci++)
    {
        m = level.a[level.ci];
        if (isArray(m))
        {
          atLeastOneArray = true;
          if (p(m[0]))
          {
            // establish context
            if (this.clevel == this.stack.length - 1)
            {
              this.stack.push({i: 0, ci: 0, a: m});
            }
            this.clevel++;
            return m[0];
          }
        }
        else
        {
          if (atLeastOneArray)
          {
            if (p(m))
            {
              return m;
            }
          }
          return null;
        }
    }
    return null;
  },

  /*
   Implementation
  */
  peek: function()
  {
    return this.stack[this.stack.length - 1];
  },

  empty: function()
  {
    while (this.stack.length > this.depth)
    {
      this.stack.pop();
    }
    return this.stack.length === 0 || this.stack.length === 1 && 
       this.stack[0].i >= this.stack[0].a.length;
  },

  pop: function()
  {
    this.depth--;
    return this.stack.pop();
  },
  
  push: function(sub)
  {
    this.depth++;
    this.stack.push({i: 0, ci: -1, a: sub});
  },

  skip: function(m)
  {
    return isArray(m) || this.ignore[m.id] !== undefined;
  }

};
