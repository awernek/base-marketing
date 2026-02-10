{
  "openapi": "3.0.1",
  "info": {
    "title": "BaseMarketing.API",
    "version": "1.0"
  },
  "paths": {
    "/api/Auth/login": {
      "post": {
        "tags": [
          "Auth"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/LoginRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/LoginResponse"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginResponse"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/Auth/register": {
      "post": {
        "tags": [
          "Auth"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RegisterRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/RegisterRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/RegisterRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/LoginResponse"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginResponse"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/CheckIns": {
      "get": {
        "tags": [
          "CheckIns"
        ],
        "parameters": [
          {
            "name": "semanaAtual",
            "in": "query",
            "schema": {
              "type": "boolean",
              "default": false
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/CheckInDto"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/CheckInDto"
                  }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/CheckInDto"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "CheckIns"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CheckInCreateDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/CheckInCreateDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/CheckInCreateDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/CheckInDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CheckInDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/CheckInDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/CheckIns/semana-atual": {
      "get": {
        "tags": [
          "CheckIns"
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/CheckInDto"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/CheckInDto"
                  }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/CheckInDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/CheckIns/pessoa/{pessoaId}": {
      "get": {
        "tags": [
          "CheckIns"
        ],
        "parameters": [
          {
            "name": "pessoaId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/CheckInDto"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/CheckInDto"
                  }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/CheckInDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Dashboard/overview": {
      "get": {
        "tags": [
          "Dashboard"
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/DashboardOverviewDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DashboardOverviewDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/DashboardOverviewDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/Demandas": {
      "get": {
        "tags": [
          "Demandas"
        ],
        "parameters": [
          {
            "name": "ativas",
            "in": "query",
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/DemandaDto"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/DemandaDto"
                  }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/DemandaDto"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Demandas"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DemandaCreateDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DemandaCreateDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DemandaCreateDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/DemandaDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DemandaDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/DemandaDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/Demandas/ativas": {
      "get": {
        "tags": [
          "Demandas"
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/DemandaDto"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/DemandaDto"
                  }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/DemandaDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Demandas/risco": {
      "get": {
        "tags": [
          "Demandas"
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/DemandaDto"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/DemandaDto"
                  }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/DemandaDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Demandas/{id}": {
      "get": {
        "tags": [
          "Demandas"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/DemandaDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DemandaDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/DemandaDto"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Demandas"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DemandaUpdateDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DemandaUpdateDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DemandaUpdateDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Demandas/{id}/status": {
      "put": {
        "tags": [
          "Demandas"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DemandaStatusDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DemandaStatusDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DemandaStatusDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Demandas/{id}/concluir": {
      "put": {
        "tags": [
          "Demandas"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Pessoas": {
      "get": {
        "tags": [
          "Pessoas"
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/PessoaCompletaDto"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/PessoaCompletaDto"
                  }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/PessoaCompletaDto"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Pessoas"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PessoaCreateDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/PessoaCreateDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/PessoaCreateDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/PessoaCompletaDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PessoaCompletaDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/PessoaCompletaDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/Pessoas/lista": {
      "get": {
        "tags": [
          "Pessoas"
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/PessoaPublicaDto"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/PessoaPublicaDto"
                  }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/PessoaPublicaDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Pessoas/{id}": {
      "get": {
        "tags": [
          "Pessoas"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/PessoaCompletaDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PessoaCompletaDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/PessoaCompletaDto"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Pessoas"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PessoaUpdateDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/PessoaUpdateDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/PessoaUpdateDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "delete": {
        "tags": [
          "Pessoas"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Pessoas/{id}/notas": {
      "put": {
        "tags": [
          "Pessoas"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/NotasRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/NotasRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/NotasRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "CargaSemanal": {
        "enum": [
          0,
          1,
          2
        ],
        "type": "integer",
        "format": "int32"
      },
      "CheckInCreateDto": {
        "type": "object",
        "properties": {
          "pessoaId": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "carga": {
            "$ref": "#/components/schemas/CargaSemanal"
          },
          "bloqueio": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "CheckInDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "format": "int32"
          },
          "pessoaId": {
            "type": "integer",
            "format": "int32"
          },
          "pessoaNome": {
            "type": "string",
            "nullable": true
          },
          "data": {
            "type": "string",
            "format": "date-time"
          },
          "carga": {
            "$ref": "#/components/schemas/CargaSemanal"
          },
          "bloqueio": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "DashboardOverviewDto": {
        "type": "object",
        "properties": {
          "totalPessoasAtivas": {
            "type": "integer",
            "format": "int32"
          },
          "totalDemandasAtivas": {
            "type": "integer",
            "format": "int32"
          },
          "pessoasComCargaAlta": {
            "type": "integer",
            "format": "int32"
          },
          "demandasEmRisco": {
            "type": "integer",
            "format": "int32"
          },
          "checkInsPendentes": {
            "type": "integer",
            "format": "int32"
          }
        },
        "additionalProperties": false
      },
      "DemandaCreateDto": {
        "type": "object",
        "properties": {
          "titulo": {
            "type": "string",
            "nullable": true
          },
          "tipo": {
            "$ref": "#/components/schemas/TipoDemanda"
          },
          "responsavelId": {
            "type": "integer",
            "format": "int32"
          },
          "prazo": {
            "type": "string",
            "format": "date-time"
          },
          "impacto": {
            "$ref": "#/components/schemas/ImpactoNegocio"
          }
        },
        "additionalProperties": false
      },
      "DemandaDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "format": "int32"
          },
          "titulo": {
            "type": "string",
            "nullable": true
          },
          "tipo": {
            "$ref": "#/components/schemas/TipoDemanda"
          },
          "responsavelId": {
            "type": "integer",
            "format": "int32"
          },
          "responsavelNome": {
            "type": "string",
            "nullable": true
          },
          "prazo": {
            "type": "string",
            "format": "date-time"
          },
          "impacto": {
            "$ref": "#/components/schemas/ImpactoNegocio"
          },
          "status": {
            "$ref": "#/components/schemas/StatusDemanda"
          },
          "concluida": {
            "type": "boolean"
          },
          "criadaEm": {
            "type": "string",
            "format": "date-time"
          },
          "atualizadaEm": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "DemandaStatusDto": {
        "type": "object",
        "properties": {
          "status": {
            "$ref": "#/components/schemas/StatusDemanda"
          }
        },
        "additionalProperties": false
      },
      "DemandaUpdateDto": {
        "type": "object",
        "properties": {
          "titulo": {
            "type": "string",
            "nullable": true
          },
          "tipo": {
            "$ref": "#/components/schemas/TipoDemanda"
          },
          "responsavelId": {
            "type": "integer",
            "format": "int32"
          },
          "prazo": {
            "type": "string",
            "format": "date-time"
          },
          "impacto": {
            "$ref": "#/components/schemas/ImpactoNegocio"
          },
          "status": {
            "$ref": "#/components/schemas/StatusDemanda"
          }
        },
        "additionalProperties": false
      },
      "ImpactoNegocio": {
        "enum": [
          0,
          1,
          2
        ],
        "type": "integer",
        "format": "int32"
      },
      "LoginRequest": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "nullable": true
          },
          "senha": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "LoginResponse": {
        "type": "object",
        "properties": {
          "token": {
            "type": "string",
            "nullable": true
          },
          "tipo": {
            "$ref": "#/components/schemas/TipoUsuario"
          },
          "pessoaId": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "email": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "NotasRequest": {
        "type": "object",
        "properties": {
          "notas": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "PessoaCompletaDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "format": "int32"
          },
          "nome": {
            "type": "string",
            "nullable": true
          },
          "email": {
            "type": "string",
            "nullable": true
          },
          "ativo": {
            "type": "boolean"
          },
          "notasCoordenacao": {
            "type": "string",
            "nullable": true
          },
          "cargaAtual": {
            "type": "string",
            "nullable": true
          },
          "demandasAtivas": {
            "type": "integer",
            "format": "int32"
          }
        },
        "additionalProperties": false
      },
      "PessoaCreateDto": {
        "type": "object",
        "properties": {
          "nome": {
            "type": "string",
            "nullable": true
          },
          "email": {
            "type": "string",
            "nullable": true
          },
          "notasCoordenacao": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "PessoaPublicaDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "format": "int32"
          },
          "nome": {
            "type": "string",
            "nullable": true
          },
          "email": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "PessoaUpdateDto": {
        "type": "object",
        "properties": {
          "nome": {
            "type": "string",
            "nullable": true
          },
          "email": {
            "type": "string",
            "nullable": true
          },
          "notasCoordenacao": {
            "type": "string",
            "nullable": true
          },
          "ativo": {
            "type": "boolean"
          }
        },
        "additionalProperties": false
      },
      "RegisterRequest": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "nullable": true
          },
          "senha": {
            "type": "string",
            "nullable": true
          },
          "tipo": {
            "$ref": "#/components/schemas/TipoUsuario"
          },
          "pessoaId": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "StatusDemanda": {
        "enum": [
          0,
          1,
          2
        ],
        "type": "integer",
        "format": "int32"
      },
      "TipoDemanda": {
        "enum": [
          0,
          1,
          2,
          3,
          4
        ],
        "type": "integer",
        "format": "int32"
      },
      "TipoUsuario": {
        "enum": [
          0,
          1
        ],
        "type": "integer",
        "format": "int32"
      }
    }
  }
}